/**
 * Tipos compartidos del sistema
 */

// Usuario
export interface User {
  id: number;
  username: string;
  nombre: string;
  email: string;
  rol: RoleKey;
  area: string;
  activo: boolean;
  tiene_face_id?: boolean;
}

// Roles
export type RoleKey = 'admin' | 'tsys' | 'distribucion' | 'modulos' | 'consulta' | 'almacen' | 'logistica' | 'sucursales';

export interface RoleConfig {
  nombre: string;
  area: string;
  color: string;
  modulos: string[];
}

export interface RolesConfig {
  [key: string]: RoleConfig;
}

// Producto
export interface Producto {
  id: string;
  nombre: string;
  proveedor: string;
  tiempoEntrega: number;
  costoUnitario: number;
  marca: string;
  tipo: string;
  activo: boolean;
}

// Proveedor
export interface Proveedor {
  id: number;
  nombre: string;
  tiempoEntrega: number;
  contacto: string;
}

// Inventario
export interface InventarioAlmacen {
  bovedaTrabajo: number;
  bovedaPrincipal: number;
}

export interface InventarioEnProceso {
  cantidad: number;
  ordenesActivas: number;
}

export interface InventarioLogistica {
  colocacion: number;
  normal: number;
  devoluciones: number;
}

export interface InventarioSucursales {
  colocacion: number;
  stock: number;
}

export interface ForecastItem {
  mes: string;
  colocacion: number;
  trascoRep: number;
  btb: number;
  renovAnticipada: number;
  forecast: number;
  disponibleConCompra: number;
  disponibleSinCompra: number;
  atiendeConCompra: boolean;
  atiendeSinCompra: boolean;
}

export interface ComprasInfo {
  fechaSugerida: string;
  fechaEntrega: string;
  mesAlerta: string;
  presupuesto: { [key: string]: number };
}

export interface InventarioProducto {
  almacen: InventarioAlmacen;
  enProceso: InventarioEnProceso;
  logistica: InventarioLogistica;
  sucursales: InventarioSucursales;
  forecast: ForecastItem[];
  compras: ComprasInfo;
}

export interface InventarioData {
  [productoId: string]: InventarioProducto;
}

// Historial de capturas
export interface HistorialCaptura {
  id: number;
  usuarioId: number;
  usuario: string;
  area: string;
  producto: string;
  tipo: string;
  valores: Record<string, number>;
  fecha: string;
  estatus: string;
}

// Órdenes de compra
export interface OrdenCompra {
  id: string;
  producto: string;
  proveedor: string;
  cantidad: number;
  presupuesto: string;
  estatus: string;
  fechaOrden: string;
  fechaEntrega: string;
}

// Branding
export interface DemoCredential {
  user: string;
  pass: string;
  label: string;
}

export interface LogoConfig {
  type: 'text' | 'image';
  imagePath: string;
  imageAlt: string;
}

export interface BrandingConfig {
  companyName: string;
  companySubtitle: string;
  fullName: string;
  systemName: string;
  systemDescription: string;
  sidebarSubtitle: string;
  pageTitle: string;
  showDemo: boolean;
  demoCredentials: {
    admin: DemoCredential;
    almacen: DemoCredential;
    logistica: DemoCredential;
    sucursales: DemoCredential;
    consulta: DemoCredential;
  };
  logo: LogoConfig;
}

// Theme
export interface ThemeBrand {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  shadow: string;
}

export interface ThemeStatus {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeNeutral {
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
}

export interface ThemeConfig {
  brand: ThemeBrand;
  status: ThemeStatus;
  neutral: ThemeNeutral;
}

// Auth
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

// API Response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Module
export interface ModuleConfig {
  id: string;
  title: string;
  icon: string;
  path: string;
  roles: RoleKey[];
}

// Tenant Configuration (Multi-tenant support)
export interface TenantBranding {
  companyName: string;
  companySubtitle: string;
  fullName: string;
  systemName: string;
  systemDescription: string;
  sidebarSubtitle: string;
  pageTitle: string;
  logo: LogoConfig;
}

export interface TenantTheme {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  sidebar: string;
}

export interface TenantFeatures {
  showDemo: boolean;
  enableForecast: boolean;
  enableOrders: boolean;
  enableFacialRecognition: boolean;
  enableExcelExport: boolean;
  enablePDFExport: boolean;
}

export interface TenantApi {
  baseUrl: string;
}

export interface TenantConfig {
  id: string;
  name: string;
  branding: TenantBranding;
  theme: TenantTheme;
  features: TenantFeatures;
  demoCredentials: Partial<Record<string, DemoCredential>>;
  api: TenantApi;
}
