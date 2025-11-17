#!/usr/bin/env python3
"""
Comprehensive API endpoint testing for ML Frontend application.
Tests backend integration, fallback mechanisms, and error handling.
"""

import asyncio
import json
import time
from playwright.async_api import async_playwright
from urllib.parse import urlencode
import sys

class APITestResult:
    def __init__(self, test_name, url, method="GET"):
        self.test_name = test_name
        self.url = url
        self.method = method
        self.success = False
        self.status_code = None
        self.response_time = None
        self.response_headers = {}
        self.response_body = None
        self.error_message = None
        self.backend_used = False
        self.notes = []

    def add_note(self, note):
        self.notes.append(note)

    def to_dict(self):
        return {
            "test_name": self.test_name,
            "url": self.url,
            "method": self.method,
            "success": self.success,
            "status_code": self.status_code,
            "response_time_ms": self.response_time,
            "response_headers": dict(self.response_headers),
            "backend_used": self.backend_used,
            "error_message": self.error_message,
            "notes": self.notes
        }

    def print_summary(self):
        status = "✅ SUCCESS" if self.success else "❌ FAILURE"
        print(f"\n{status} - {self.test_name}")
        print(f"  URL: {self.url}")
        print(f"  Status: {self.status_code}")
        print(f"  Response Time: {self.response_time}ms")
        if self.backend_used:
            print(f"  Backend: 119.67.194.202:31332")
        if self.error_message:
            print(f"  Error: {self.error_message}")
        for note in self.notes:
            print(f"  Note: {note}")

class APITester:
    def __init__(self, base_url="https://ml-frontend-liart-ten-59.vercel.app"):
        self.base_url = base_url
        self.results = []

    async def test_endpoint(self, test_name, endpoint_path, params=None, expected_content_type=None, check_download=False):
        """Test a single API endpoint"""
        if params:
            url = f"{self.base_url}{endpoint_path}?{urlencode(params)}"
        else:
            url = f"{self.base_url}{endpoint_path}"

        result = APITestResult(test_name, url)

        try:
            start_time = time.time()

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()

                # Capture response details
                response = await page.goto(url, wait_until="networkidle")
                end_time = time.time()

                result.response_time = round((end_time - start_time) * 1000)
                result.status_code = response.status

                # Get response headers
                headers = await response.headers()
                result.response_headers = headers

                # Check content type
                content_type = result.response_headers.get('content-type', '').split(';')[0]
                if expected_content_type and content_type != expected_content_type:
                    result.add_note(f"Expected content-type {expected_content_type}, got {content_type}")

                # Check CORS headers
                cors_headers = ['access-control-allow-origin', 'access-control-allow-methods', 'access-control-allow-headers']
                cors_present = any(header.lower() in result.response_headers for header in cors_headers)
                if cors_present:
                    result.add_note("CORS headers present")
                else:
                    result.add_note("No CORS headers detected")

                # Handle different response types
                if check_download and 'application/octet-stream' in content_type:
                    # Handle file download
                    try:
                        # Get the response as text for CSV files
                        response_text = await page.evaluate("() => document.body.innerText")
                        result.response_body = response_text[:1000]  # First 1000 chars

                        # Check for Content-Disposition header
                        content_disposition = result.response_headers.get('content-disposition', '')
                        if 'attachment' in content_disposition:
                            result.add_note(f"Content-Disposition: {content_disposition}")

                    except Exception as e:
                        result.error_message = f"Error reading download response: {str(e)}"

                elif content_type == 'application/json':
                    # Handle JSON response
                    try:
                        response_text = await page.evaluate("() => document.body.innerText")
                        result.response_body = json.loads(response_text)

                        # Check if backend data was used (look for real data patterns)
                        if isinstance(result.response_body, dict) or isinstance(result.response_body, list):
                            # Look for indicators of real backend data
                            response_str = json.dumps(result.response_body)
                            if any(indicator in response_str for indicator in ['2025-', 'user', 'profile', 'real']):
                                result.backend_used = True
                                result.add_note("Backend data detected")
                            else:
                                result.add_note("Mock data detected")

                    except json.JSONDecodeError as e:
                        result.error_message = f"Invalid JSON response: {str(e)}"
                        result.response_body = await page.evaluate("() => document.body.innerText")[:500]

                else:
                    # Handle text or other responses
                    result.response_body = await page.evaluate("() => document.body.innerText")[:1000]

                await browser.close()

            # Determine success
            result.success = (200 <= result.status_code < 300) and (result.error_message is None)

        except Exception as e:
            result.error_message = str(e)
            result.response_time = None
            result.success = False

        self.results.append(result)
        return result

    async def run_all_tests(self):
        """Run comprehensive API endpoint tests"""
        print("🚀 Starting Comprehensive API Endpoint Testing")
        print("=" * 60)

        # Test 1: Main datasets endpoint
        print("\n📊 Testing main datasets endpoint...")
        await self.test_endpoint(
            "Main Datasets Endpoint",
            "/api/datasets",
            expected_content_type="application/json"
        )

        # Test 2: Profiles endpoint with validation dataset
        print("\n👥 Testing profiles endpoint (validation dataset)...")
        await self.test_endpoint(
            "Profiles - Validation Dataset",
            "/api/datasets",
            params={
                "show": "profiles",
                "datasetType": "validation",
                "page": "1",
                "page_size": "10"
            },
            expected_content_type="application/json"
        )

        # Test 3: Profiles endpoint with test dataset
        print("\n🧪 Testing profiles endpoint (test dataset)...")
        await self.test_endpoint(
            "Profiles - Test Dataset",
            "/api/datasets",
            params={
                "show": "profiles",
                "datasetType": "test",
                "page": "1",
                "page_size": "5"
            },
            expected_content_type="application/json"
        )

        # Test 4: Profiles endpoint with learning dataset
        print("\n📚 Testing profiles endpoint (learning dataset)...")
        await self.test_endpoint(
            "Profiles - Learning Dataset",
            "/api/datasets",
            params={
                "show": "profiles",
                "datasetType": "learning",
                "page": "1",
                "page_size": "5"
            },
            expected_content_type="application/json"
        )

        # Test 5: Export endpoint with validation dataset
        print("\n📤 Testing export endpoint (validation dataset)...")
        await self.test_endpoint(
            "Export - Validation Dataset",
            "/api/datasets",
            params={
                "show": "export",
                "datasetType": "validation"
            },
            check_download=True
        )

        # Test 6: Export endpoint with test dataset
        print("\n🧪 Testing export endpoint (test dataset)...")
        await self.test_endpoint(
            "Export - Test Dataset",
            "/api/datasets",
            params={
                "show": "export",
                "datasetType": "test"
            },
            check_download=True
        )

        # Test 7: Export endpoint with learning dataset
        print("\n📚 Testing export endpoint (learning dataset)...")
        await self.test_endpoint(
            "Export - Learning Dataset",
            "/api/datasets",
            params={
                "show": "export",
                "datasetType": "learning"
            },
            check_download=True
        )

        # Test 8: Error handling - missing datasetType
        print("\n⚠️ Testing error handling (missing datasetType)...")
        await self.test_endpoint(
            "Error - Missing DatasetType",
            "/api/datasets",
            params={"show": "profiles"}  # Missing datasetType
        )

        # Test 9: Error handling - invalid show parameter
        print("\n❌ Testing error handling (invalid show parameter)...")
        await self.test_endpoint(
            "Error - Invalid Show Parameter",
            "/api/datasets",
            params={
                "show": "invalid",
                "datasetType": "validation"
            }
        )

        # Test 10: Pagination testing
        print("\n📄 Testing pagination (page 2, larger page size)...")
        await self.test_endpoint(
            "Pagination Test",
            "/api/datasets",
            params={
                "show": "profiles",
                "datasetType": "validation",
                "page": "2",
                "page_size": "20"
            },
            expected_content_type="application/json"
        )

        # Test 11: Performance test with large page size
        print("\n⚡ Testing performance (large page size)...")
        await self.test_endpoint(
            "Performance Test - Large Page",
            "/api/datasets",
            params={
                "show": "profiles",
                "datasetType": "validation",
                "page": "1",
                "page_size": "100"
            },
            expected_content_type="application/json"
        )

    def print_summary_report(self):
        """Print comprehensive summary report"""
        print("\n" + "=" * 80)
        print("📋 COMPREHENSIVE API TEST REPORT")
        print("=" * 80)

        total_tests = len(self.results)
        successful_tests = sum(1 for r in self.results if r.success)
        failed_tests = total_tests - successful_tests
        backend_tests = sum(1 for r in self.results if r.backend_used)

        print(f"\n📊 SUMMARY:")
        print(f"  Total Tests: {total_tests}")
        print(f"  ✅ Successful: {successful_tests}")
        print(f"  ❌ Failed: {failed_tests}")
        print(f"  🔗 Backend Data Used: {backend_tests}")
        print(f"  📝 Mock Data Used: {total_tests - backend_tests}")

        if failed_tests > 0:
            print(f"\n⚠️ FAILED TESTS:")
            for result in self.results:
                if not result.success:
                    print(f"  ❌ {result.test_name}: {result.error_message}")

        print(f"\n📈 PERFORMANCE ANALYSIS:")
        response_times = [r.response_time for r in self.results if r.response_time]
        if response_times:
            avg_time = sum(response_times) / len(response_times)
            min_time = min(response_times)
            max_time = max(response_times)
            print(f"  Average Response Time: {avg_time:.0f}ms")
            print(f"  Fastest: {min_time}ms")
            print(f"  Slowest: {max_time}ms")

        print(f"\n🔍 DETAILED RESULTS:")
        for result in self.results:
            result.print_summary()

        print(f"\n🎯 KEY FINDINGS:")

        # Backend integration check
        if backend_tests > 0:
            print(f"  ✅ Backend integration working (119.67.194.202:31332)")
        else:
            print(f"  ⚠️ No backend data detected - all responses using mock data")

        # Content type checks
        json_responses = sum(1 for r in self.results
                           if r.response_headers and 'application/json' in r.response_headers.get('content-type', ''))
        csv_responses = sum(1 for r in self.results
                          if r.response_headers and 'csv' in r.response_headers.get('content-type', '').lower())

        print(f"  📄 JSON Responses: {json_responses}")
        print(f"  📊 CSV Downloads: {csv_responses}")

        # CORS check
        cors_responses = sum(1 for r in self.results if any('CORS' in note for note in r.notes))
        print(f"  🌐 CORS Headers: {cors_responses}/{total_tests}")

        # Success rate
        success_rate = (successful_tests / total_tests) * 100 if total_tests > 0 else 0
        print(f"  📊 Success Rate: {success_rate:.1f}%")

        if success_rate >= 90:
            print(f"  🎉 EXCELLENT: API endpoints performing well!")
        elif success_rate >= 70:
            print(f"  👍 GOOD: Most endpoints working, some issues to address")
        else:
            print(f"  ⚠️ NEEDS ATTENTION: Multiple endpoint failures detected")

async def main():
    tester = APITester()
    await tester.run_all_tests()
    tester.print_summary_report()

if __name__ == "__main__":
    asyncio.run(main())