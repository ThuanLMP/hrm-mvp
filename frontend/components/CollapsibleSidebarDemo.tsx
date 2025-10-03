import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Header } from "./Header";
import { SidebarCollapsible } from "./SidebarCollapsible";
import { SidebarToggle } from "./SidebarToggle";

export function CollapsibleSidebarDemo() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="h-screen bg-gray-50">
      <div className="flex h-full">
        {/* Sidebar */}
        <SidebarCollapsible
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <main className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Collapsible Sidebar Demo
                </h1>
                <p className="text-gray-600">
                  Click the toggle button in the sidebar to collapse/expand it.
                  The sidebar will smoothly transition between states.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sidebar State</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Current state:{" "}
                        <span className="font-medium">
                          {isSidebarCollapsed ? "Collapsed" : "Expanded"}
                        </span>
                      </p>
                      <Button
                        onClick={toggleSidebar}
                        variant="outline"
                        size="sm"
                      >
                        Toggle Sidebar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Toggle Button Demo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Standalone toggle button:
                      </p>
                      <SidebarToggle
                        isCollapsed={isSidebarCollapsed}
                        onToggle={toggleSidebar}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">When Collapsed:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Only icons are visible</li>
                        <li>• Tooltips show on hover</li>
                        <li>• Sidebar width: 64px (4rem)</li>
                        <li>• Smooth transition animation</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">When Expanded:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Full text labels visible</li>
                        <li>• Section headers shown</li>
                        <li>• Sidebar width: 256px (16rem)</li>
                        <li>• Complete navigation experience</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Responsive Behavior</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      The sidebar automatically adapts to different screen
                      sizes:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1">
                          Mobile (&lt; 640px)
                        </h4>
                        <p className="text-blue-700">
                          Sidebar collapses automatically
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-1">
                          Tablet (640px - 1024px)
                        </h4>
                        <p className="text-green-700">
                          Manual toggle available
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-1">
                          Desktop (&gt; 1024px)
                        </h4>
                        <p className="text-purple-700">
                          Full sidebar experience
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
