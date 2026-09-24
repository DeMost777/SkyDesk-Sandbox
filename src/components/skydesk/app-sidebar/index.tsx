import { SquareTerminal } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { HistoryEntry } from '@/lib/booking-history'
import { initials, type AgentUser } from '@/lib/user'
import { HistoryItem } from './history-item'
import { TravaLogo } from './trava-logo'

// Flow doc: projects/app-sidebar/README.md. Figma 548:16649 (Type=Default).
// Every click target has its states; none has behaviour yet (user decision, 2026-09-23).

export interface AppSidebarProps {
  /** Most recent first, as the source returns it. */
  history: HistoryEntry[]
  user: AgentUser
  /** PNR of the booking open right now, if any. */
  activePnr?: string | null
  /** Reference point for "Today" in History. */
  now?: Date
  onBrandClick?: () => void
  onNewChat?: () => void
  onSelect?: (entry: HistoryEntry) => void
  onUserClick?: () => void
  className?: string
}

export function AppSidebar({
  history,
  user,
  activePnr = null,
  now = new Date(),
  onBrandClick,
  onNewChat,
  onSelect,
  onUserClick,
  className,
}: AppSidebarProps) {
  return (
    <Sidebar aria-label="Sidebar" className={className}>
      <SidebarHeader>
        <SidebarBrand onClick={onBrandClick} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <NewChatButton onClick={onNewChat} />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel id="sidebar-history">History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu aria-labelledby="sidebar-history">
              {history.map((entry) => (
                <SidebarMenuItem key={entry.pnr}>
                  <HistoryItem entry={entry} now={now} isActive={entry.pnr === activePnr} onSelect={onSelect} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarUser user={user} onClick={onUserClick} />
      </SidebarFooter>
    </Sidebar>
  )
}

export function SidebarBrand({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <SidebarMenuButton size="lg" onClick={onClick} className={className}>
      <TravaLogo />
      <span className="flex-1 truncate font-semibold">Trava Sky Desk</span>
    </SidebarMenuButton>
  )
}

export function NewChatButton({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <SidebarMenuButton onClick={onClick} className={className}>
      <SquareTerminal aria-hidden />
      <span className="flex-1 truncate text-sidebar-primary">New chat</span>
    </SidebarMenuButton>
  )
}

export function SidebarUser({
  user,
  onClick,
  className,
}: {
  user: AgentUser
  onClick?: () => void
  className?: string
}) {
  return (
    <SidebarMenuButton size="lg" onClick={onClick} className={className}>
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border-muted bg-sidebar-foreground text-xs font-medium text-primary-foreground"
      >
        {initials(user.name)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-semibold">{user.name}</span>
        <span className="truncate text-xs">{user.email}</span>
      </span>
    </SidebarMenuButton>
  )
}

export { HistoryItem } from './history-item'
