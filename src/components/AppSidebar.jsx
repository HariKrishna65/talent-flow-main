import { Briefcase, Users, FileText, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';

export function AppSidebar() {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    if (user?.role === 'hr') return [
      { title: 'Jobs', url: '/jobs', icon: Briefcase },
      { title: 'Candidates', url: '/candidates', icon: Users },
      { title: 'Assessments', url: '/assessments', icon: FileText },
    ];
    if (user?.role === 'candidate') return [
      { title: 'Jobs', url: '/jobs', icon: Briefcase },
      { title: 'Assessments', url: '/assessments', icon: FileText },
    ];
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <h1 className="text-xl font-bold text-sidebar-primary">TalentFlow</h1>
        <p className="text-xs text-sidebar-foreground/60">{user?.role === 'hr' ? 'HR Portal' : 'Candidate Portal'}</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={({ isActive }) => (isActive ? 'bg-sidebar-accent text-sidebar-primary font-medium' : 'hover:bg-sidebar-accent/50')}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="space-y-2">
          <div className="text-sm text-sidebar-foreground/60">Logged in as: {user?.name}</div>
          <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}


