#!/usr/bin/env python3
"""
Simple API endpoint testing using Playwright
"""

import asyncio
import json
import time
from playwright.async_api import async_playwright

async def test_api_endpoint(page, url, test_name):
    """Test a single API endpoint"""
    print(f"\n🔍 Testing: {test_name}")
    print(f"URL: {url}")

    try:
        start_time = time.time()

        # Navigate to the API endpoint
        response = await page.goto(url, wait_until="networkidle")
        end_time = time.time()

        response_time = round((end_time - start_time) * 1000)
        status_code = response.status

        print(f"Status: {status_code}")
        print(f"Response Time: {response_time}ms")

        # Get headers
        headers = await response.headers()
        content_type = headers.get('content-type', 'Not specified')
        print(f"Content-Type: {content_type}")

        # Check CORS
        cors_origin = headers.get('access-control-allow-origin', 'Not present')
        print(f"CORS Origin: {cors_origin}")

        # Get response content
        content = await page.content()

        # Try to extract JSON or text from the body
        try:
            body_text = await page.evaluate("() => document.body.innerText")

            if 'application/json' in content_type:
                data = json.loads(body_text)
                print(f"Response: {json.dumps(data, indent=2)[:500]}...")

                # Check if it looks like real backend data
                response_str = json.dumps(data)
                if any(keyword in response_str.lower() for keyword in ['2025', 'user', 'profile', 'student']):
                    print("✅ Backend data detected")
                    backend_used = True
                else:
                    print("📝 Mock data detected")
                    backend_used = False

            elif 'csv' in content_type.lower() or 'text' in content_type.lower():
                print(f"CSV/Text Response: {body_text[:200]}...")
                backend_used = False
            else:
                print(f"Other Response: {body_text[:200]}...")
                backend_used = False

        except Exception as e:
            print(f"Error parsing response: {e}")
            backend_used = False

        # Determine success
        success = 200 <= status_code < 300
        if success:
            print("✅ SUCCESS")
        else:
            print("❌ FAILURE")

        return {
            "success": success,
            "status_code": status_code,
            "response_time": response_time,
            "backend_used": backend_used,
            "content_type": content_type,
            "cors_present": cors_origin != 'Not present'
        }

    except Exception as e:
        print(f"❌ ERROR: {e}")
        return {
            "success": False,
            "error": str(e),
            "backend_used": False
        }

async def main():
    base_url = "https://ml-frontend-liart-ten-59.vercel.app"

    print("🚀 API Endpoint Testing")
    print("=" * 60)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        results = []

        # Test endpoints
        test_cases = [
            ("Main Datasets", f"{base_url}/api/datasets"),
            ("Profiles - Validation", f"{base_url}/api/datasets?show=profiles&datasetType=validation&page=1&page_size=10"),
            ("Profiles - Test", f"{base_url}/api/datasets?show=profiles&datasetType=test&page=1&page_size=5"),
            ("Profiles - Learning", f"{base_url}/api/datasets?show=profiles&datasetType=learning&page=1&page_size=5"),
            ("Export - Validation", f"{base_url}/api/datasets?show=export&datasetType=validation"),
            ("Export - Test", f"{base_url}/api/datasets?show=export&datasetType=test"),
            ("Export - Learning", f"{base_url}/api/datasets?show=export&datasetType=learning"),
            ("Error - Missing Type", f"{base_url}/api/datasets?show=profiles"),
            ("Error - Invalid Show", f"{base_url}/api/datasets?show=invalid&datasetType=validation"),
        ]

        for test_name, url in test_cases:
            result = await test_api_endpoint(page, url, test_name)
            results.append((test_name, result))

        # Summary
        print("\n" + "=" * 60)
        print("📊 SUMMARY REPORT")
        print("=" * 60)

        total = len(results)
        successful = sum(1 for _, r in results if r.get("success", False))
        backend_used = sum(1 for _, r in results if r.get("backend_used", False))

        print(f"\nTotal Tests: {total}")
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {total - successful}")
        print(f"🔗 Backend Data: {backend_used}")
        print(f"📝 Mock Data: {total - backend_used}")

        print(f"\nDetailed Results:")
        for test_name, result in results:
            status = "✅" if result.get("success") else "❌"
            time_ms = result.get("response_time", "N/A")
            backend = "🔗" if result.get("backend_used") else "📝"
            print(f"{status} {backend} {test_name}: {time_ms}ms")

        if successful == total:
            print("\n🎉 All tests passed!")
        elif successful >= total * 0.7:
            print("\n👍 Most tests passed - some issues to address")
        else:
            print("\n⚠️ Multiple issues detected - needs attention")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())