import {
  LayoutDashboard,
  GitBranch,
  Clock,
  Compass,
  TrendingUp,
  BarChart2,
  Building2,
  CreditCard,
  FileText,
  MessageSquare,
  Briefcase,
  Map,
  UserCheck,
  Settings,
} from 'lucide-react'

export const NAVIGATION_SECTIONS = [
  {
    title: 'WORKSPACE',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { id: 'leads', label: 'Leads pipeline', icon: GitBranch, badge: '12', path: '/leads' },
      { id: 'followups', label: 'Follow-ups', icon: Clock, badge: '5', path: '/followups' },
      { id: 'visits', label: 'Site visits', icon: Compass, path: '/visits' },
    ],
  },
  {
    title: 'INSIGHTS',
    items: [
      { id: 'management', label: 'Management', icon: TrendingUp, path: '/management' },
      { id: 'reports', label: 'Reports', icon: BarChart2, path: '/reports' },
    ],
  },
  {
    title: 'SALES',
    items: [
      { id: 'properties', label: 'Properties', icon: Building2, path: '/properties' },
      { id: 'payments', label: 'Payments', icon: CreditCard, badge: '1', path: '/payments' },
      { id: 'documents', label: 'Documents', icon: FileText, badge: '2', path: '/documents' },
      { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, badge: '3', path: '/whatsapp' },
    ],
  },
  {
    title: 'LAND',
    items: [
      { id: 'vendors', label: 'Vendors & landowners', icon: Briefcase, path: '/vendors' },
      { id: 'landrecords', label: 'Land records', icon: Map, path: '/landrecords' },
    ],
  },
  {
    title: 'ADMIN',
    items: [
      { id: 'team', label: 'Team & roles', icon: UserCheck, path: '/team' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    ],
  },
]
