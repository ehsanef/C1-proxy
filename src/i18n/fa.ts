/**
 * Persian (Farsi) translation dictionary for C1 Proxy.
 * Provides authentic, professional Persian networking terminology.
 */

import { TranslationKey } from './en';

export const fa: Record<TranslationKey, string> = {
  brand: 'پروکسی C1',
  brand_control: 'کنترل پنل C1',
  edge_online: 'سرور فعال است',
  edge_offline: 'سرور غیرفعال',

  // Navigation
  nav_overview: 'داشبورد',
  nav_users: 'کاربران',
  nav_inbounds: 'اینباندها',
  nav_radar: 'رادار C1',
  nav_routing: 'مسیریابی',
  nav_subscriptions: 'اشتراک‌ها',
  nav_settings: 'تنظیمات',
  nav_logout: 'خروج',

  // Metrics & Status
  users_count: 'کل کاربران',
  active_users: 'کاربران فعال',
  traffic_used: 'ترافیک مصرفی',
  system_health: 'سلامت سامانه',
  protocols: 'پروتکل‌ها',
  recent_activity: 'فعالیت‌های اخیر',

  // System Health
  worker_status: 'کلودفلر ورکر',
  d1_status: 'پایگاه داده D1',
  kv_status: 'حافظه موقت KV',
  migrations_status: 'مایگریشن‌ها',
  healthy: 'سالم',
  current: 'به‌روز',
  degraded: 'دارای اختلال',

  // Users Page
  add_user: 'افزودن کاربر',
  search_users: 'جستجوی کاربر...',
  all_status: 'همه وضعیت‌ها',
  status_active: 'فعال',
  status_disabled: 'غیرفعال',
  status_expired: 'منقضی شده',
  user_name: 'نام کاربر',
  username: 'نام کاربری',
  traffic: 'ترافیک',
  expires: 'تاریخ انقضا',
  actions: 'عملیات',
  manage: 'مدیریت',
  quick_copy_sub: 'کپی لینک اشتراک',
  never_expires: 'نامحدود',

  // User Detail
  user_overview: 'اطلاعات کاربر',
  credentials: 'شناسه‌ها و کلیدها',
  direct_connections: 'اتصال‌های مستقیم',
  universal_subscription: 'لینک اشتراک جامع',
  copy_uri: 'کپی لینک',
  show_qr: 'بارکد QR',
  rotate_token: 'تغییر توکن اشتراک',
  rotate_vless: 'تغییر شناسه VLESS',
  rotate_trojan: 'تغییر گذرواژه تروجان',
  rotate_ss: 'تغییر گذرواژه شدوساکس',
  reset_traffic: 'صفر کردن ترافیک',
  disable_user: 'غیرفعال‌سازی کاربر',
  enable_user: 'فعال‌سازی کاربر',
  delete_user: 'حذف کاربر',
  copied: 'در حافظه کپی شد!',

  // Inbounds
  add_inbound: 'افزودن اینباند',
  inbound_name: 'نام پروفایل',
  protocol: 'پروتکل',
  port: 'پورت',
  transport: 'انتقال',
  tls: 'رمزنگاری TLS',

  // Radar
  radar_title: 'رادار C1',
  radar_desc: 'تست سرعت و کیفیت آی‌پی‌های کلودفلر مستقیماً از شبکه و اینترنت شما برای یافتن بهترین مسیر.',
  run_radar: 'شروع تست رادار',
  stop_radar: 'توقف تست',
  clear_results: 'پاکسازی نتایج',
  apply_global: 'اعمال سراسری',
  apply_to_user: 'اعمال برای کاربر',
  ip_address: 'آدرس آی‌پی',
  latency: 'پینگ / تاخیر',
  status: 'کیفیت',
  candidates_scanned: 'در حال بررسی نامزدها...',

  // Settings
  general_settings: 'عمومی',
  security_settings: 'امنیت',
  appearance: 'ظاهر و تم',
  backup_restore: 'پشتیبان‌گیری و بازیابی',
  save_changes: 'ذخیره تغییرات',
  download_backup: 'دانلود فایل پشتیبان',
  upload_restore: 'بازیابی از فایل',

  // Install
  install_title: 'راه‌اندازی اولیه C1 Proxy',
  install_subtitle: 'حساب کاربری مدیر را برای شروع به کار کنترل پنل ایجاد کنید.',
  admin_username: 'نام کاربری مدیر',
  admin_password: 'گذرواژه مدیر',
  confirm_password: 'تکرار گذرواژه',
  claim_token_optional: 'توکن راه‌اندازی (اختیاری)',
  create_admin_btn: 'تکمیل راه‌اندازی و ورود',
};
