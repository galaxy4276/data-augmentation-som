'use client';

import { useState } from 'react';
import { TaskLogViewer } from '@/components/task-log-viewer';
import { Button } from '@/components/ui/button';
import { FileText, Play } from 'lucide-react';

export default function LogsDemoPage() {
  const [showLogs, setShowLogs] = useState(false);
  const [taskId] = useState('demo-task-12345');

  const handleStartDemo = () => {
    // Demo: 실제 태스크를 시작하지 않고 로그 뷰어만 보여주기
    setShowLogs(true);
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Task Log Viewer Demo</h1>
          <p className="text-lg text-muted-foreground">
            로그 뷰어 기능을 체험해보세요
          </p>
        </div>

        <div className="space-y-6">
          {/* Demo 시작 버튼 */}
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-4">로그 뷰어 체험하기</h3>
            <p className="text-sm text-muted-foreground mb-4">
              아래 버튼을 클릭하여 로그 뷰어를 열어보세요.
              실제 태스크를 실행하지 않고 로그 뷰어의 UI 기능만 체험할 수 있습니다.
            </p>
            <Button
              onClick={handleStartDemo}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              로그 뷰어 열기
            </Button>
          </div>

          {/* 기능 설명 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                주요 기능
              </h3>
              <ul className="space-y-2 text-sm">
                <li>✅ 실시간 로그 업데이트</li>
                <li>✅ 로그 레벨별 필터링</li>
                <li>✅ 텍스트 검색 기능</li>
                <li>✅ 페이지네이션</li>
                <li>✅ 자동 스크롤</li>
                <li>✅ 상세 정보 펼쳐보기</li>
              </ul>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-3">로그 레벨</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="inline-block w-3 h-3 bg-gray-500 rounded mr-2"></span>DEBUG - 디버깅 정보</li>
                <li><span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>INFO - 일반 정보</li>
                <li><span className="inline-block w-3 h-3 bg-yellow-500 rounded mr-2"></span>WARNING - 경고</li>
                <li><span className="inline-block w-3 h-3 bg-red-500 rounded mr-2"></span>ERROR - 에러</li>
                <li><span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>SUCCESS - 성공</li>
              </ul>
            </div>
          </div>

          {/* 사용 방법 */}
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-3">사용 방법</h3>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>'로그 뷰어 열기' 버튼을 클릭합니다</li>
              <li>Drawer가 우측에서 열리며 로그가 표시됩니다</li>
              <li>상단 필터를 사용하여 원하는 로그만 볼 수 있습니다</li>
              <li>로그 항목을 클릭하여 상세 정보를 확인할 수 있습니다</li>
              <li>'Auto-scroll' 버튼으로 자동 스크롤을 제어할 수 있습니다</li>
              <li>닫기 버튼이나 바깥 영역을 클릭하여 닫을 수 있습니다</li>
            </ol>
          </div>

          {/* 기술 정보 */}
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-3">기술 스택</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>UI 프레임워크</strong>
                <div>React 19 + TypeScript</div>
              </div>
              <div>
                <strong>상태 관리</strong>
                <div>Zustand + TanStack Query</div>
              </div>
              <div>
                <strong>스타일링</strong>
                <div>Tailwind CSS + shadcn/ui</div>
              </div>
              <div>
                <strong>아이콘</strong>
                <div>Lucide React</div>
              </div>
            </div>
          </div>
        </div>

        {/* Log Viewer */}
        <TaskLogViewer
          taskId={taskId}
          isOpen={showLogs}
          onClose={() => setShowLogs(false)}
        />
      </div>
    </div>
  );
}