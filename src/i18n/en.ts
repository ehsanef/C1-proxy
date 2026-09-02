/**
 * English translation dictionary for C1 Proxy.
 */

export const en = {
  brand: 'C1 Proxy',
  brand_control: 'C1 Control',
  edge_online: 'EDGE ONLINE',
  edge_offline: 'EDGE OFFLINE',

  // Navigation
  nav_overview: 'Overview',
  nav_users: 'Users',
  nav_inbounds: 'Inbounds',
  nav_radar: 'C1 Radar',
  nav_routing: 'Routing',
  nav_subscriptions: 'Subscriptions',
  nav_settings: 'Settings',
  nav_logout: 'Logout',

  // Metrics & Status
  users_count: 'Total Users',
  active_users: 'Active Users',
  traffic_used: 'Bandwidth Used',
  system_health: 'System Health',
  protocols: 'Protocols',
  recent_activity: 'Recent Activity',

  // System Health
  worker_status: 'Cloudflare Worker',
  d1_status: 'D1 Database',
  kv_status: 'KV Cache',
  migrations_status: 'Schema Migrations',
  healthy: 'Healthy',
  current: 'Current',
  degraded: 'Degraded',

  // Users Page
  add_user: 'Add User',
  search_users: 'Search users...',
  all_status: 'All Status',
  status_active: 'Active',
  status_disabled: 'Disabled',
  status_expired: 'Expired',
  user_name: 'Name',
  username: 'Username',
  traffic: 'Traffic',
  expires: 'Expires',
  actions: 'Actions',
  manage: 'Manage',
  quick_copy_sub: 'Copy Subscription',
  never_expires: 'Never',

  // User Detail
  user_overview: 'User Overview',
  credentials: 'Credentials',
  direct_connections: 'Direct Connections',
  universal_subscription: 'Universal Subscription',
  copy_uri: 'Copy URI',
  show_qr: 'QR Code',
  rotate_token: 'Rotate Sub Token',
  rotate_vless: 'Rotate VLESS UUID',
  rotate_trojan: 'Rotate Trojan Password',
  rotate_ss: 'Rotate Shadowsocks Password',
  reset_traffic: 'Reset Traffic',
  disable_user: 'Disable Account',
  enable_user: 'Enable Account',
  delete_user: 'Delete User',
  copied: 'Copied to clipboard!',

  // Inbounds
  add_inbound: 'Add Inbound',
  inbound_name: 'Name',
  protocol: 'Protocol',
  port: 'Port',
  transport: 'Transport',
  tls: 'TLS',

  // Radar
  radar_title: 'C1 Radar',
  radar_desc: 'Scan Cloudflare edge IP endpoints directly from your browser to find the lowest latency paths.',
  run_radar: 'Start Radar Scan',
  stop_radar: 'Stop Scan',
  clear_results: 'Clear Results',
  apply_global: 'Apply Globally',
  apply_to_user: 'Apply to User',
  ip_address: 'IP Address',
  latency: 'Latency',
  status: 'Status',
  candidates_scanned: 'Scanning candidates...',

  // Settings
  general_settings: 'General',
  security_settings: 'Security',
  appearance: 'Appearance',
  backup_restore: 'Backup & Restore',
  save_changes: 'Save Changes',
  download_backup: 'Download Backup',
  upload_restore: 'Restore from File',

  // Install
  install_title: 'First-Time Installation',
  install_subtitle: 'Set up the initial administrator account to claim this C1 Proxy instance.',
  admin_username: 'Admin Username',
  admin_password: 'Admin Password',
  confirm_password: 'Confirm Password',
  claim_token_optional: 'Claim Token (Optional)',
  create_admin_btn: 'Complete Setup & Launch',
};

export type TranslationKey = keyof typeof en;
