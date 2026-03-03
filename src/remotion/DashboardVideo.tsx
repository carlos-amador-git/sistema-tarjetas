import { 
	AbsoluteFill, 
	interpolate, 
	spring, 
	useCurrentFrame, 
	useVideoConfig
} from 'remotion';

// Datos simulados basados en tu dashboard
const resumenData = {
	totalInventario: 14500,
	enAlmacen: 4900,
	enLogistica: 3200,
	enSucursales: 6400,
	enProceso: 1200,
};

const inventarioTendencia = [
	{ mes: 'Ago', inventario: 12500, almacen: 4200, logistica: 3100, sucursales: 5200 },
	{ mes: 'Sep', inventario: 13200, almacen: 4500, logistica: 3400, sucursales: 5300 },
	{ mes: 'Oct', inventario: 12800, almacen: 4300, logistica: 3000, sucursales: 5500 },
	{ mes: 'Nov', inventario: 14100, almacen: 4800, logistica: 3500, sucursales: 5800 },
	{ mes: 'Dic', inventario: 13800, almacen: 4600, logistica: 3200, sucursales: 6000 },
	{ mes: 'Ene', inventario: resumenData.totalInventario, almacen: resumenData.enAlmacen, logistica: resumenData.enLogistica, sucursales: resumenData.enSucursales },
];

// Formatear número localmente para evitar importaciones
function formatNumber(num: number): string {
	return new Intl.NumberFormat('es-MX').format(num);
}

const distribucionStock = [
	{ name: 'Almacén', value: resumenData.enAlmacen, color: '#0284c7' },
	{ name: 'Logística', value: resumenData.enLogistica, color: '#ca8a04' },
	{ name: 'Sucursales', value: resumenData.enSucursales, color: '#16a34a' },
];

// Componente para tarjeta animada
function AnimatedStatCard({ 
	title, 
	value, 
	iconName, 
	color, 
	delay = 0 
}: {
	title: string;
	value: string | number;
	iconName: string;
	color: string;
	delay?: number;
}) {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	
	const slideIn = spring({
		frame: frame - delay,
		fps,
		config: { damping: 12 },
	});

	const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const transform = `translateY(${30 * (1 - slideIn)}px)`;

	// Iconos simples SVG
	const getIcon = (name: string) => {
		switch(name) {
			case 'CreditCard':
				return (
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '28px', height: '28px', color: 'white' }}>
						<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
						<line x1="1" y1="10" x2="23" y2="10"></line>
					</svg>
				);
			case 'Package':
				return (
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '28px', height: '28px', color: 'white' }}>
						<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
						<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
					</svg>
				);
			case 'Truck':
				return (
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '28px', height: '28px', color: 'white' }}>
						<rect x="1" y="3" width="15" height="13"></rect>
						<polygon points="16,8 20,8 23,11 23,16 16,16"></polygon>
						<circle cx="5.5" cy="18.5" r="2.5"></circle>
						<circle cx="18.5" cy="18.5" r="2.5"></circle>
					</svg>
				);
			case 'Building2':
				return (
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '28px', height: '28px', color: 'white' }}>
						<path d="M3 21V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v13"></path>
						<path d="M15 21V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v12"></path>
					</svg>
				);
			default:
				return null;
		}
	};

	return (
		<div
			style={{
				opacity,
				transform,
				background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
				borderRadius: '16px',
				padding: '32px',
				border: '1px solid #e2e8f0',
				boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
			}}
		>
			<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
				<div
					style={{
						width: '56px',
						height: '56px',
						borderRadius: '12px',
						backgroundColor: color,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{getIcon(iconName)}
				</div>
				<div>
					<div
						style={{
							fontSize: '18px',
							color: '#64748b',
							marginBottom: '8px',
						}}
					>
						{title}
					</div>
					<div
						style={{
							fontSize: '32px',
							fontWeight: 'bold',
							color: '#1e293b',
						}}
					>
						{value}
					</div>
				</div>
			</div>
		</div>
	);
}

// Componente para gráfico de barras simple
function BarChart({ data, delay = 0 }: { data: typeof inventarioTendencia; delay?: number }) {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	
	const progress = spring({
		frame: frame - delay,
		fps,
		config: { damping: 15 },
	});

	const chartHeight = 200;
	const maxValue = Math.max(...data.map(d => d.almacen + d.logistica + d.sucursales));
	const barWidth = 60;
	const gap = 20;

	return (
		<div
			style={{
				background: 'white',
				borderRadius: '16px',
				padding: '32px',
				border: '1px solid #e2e8f0',
				boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
			}}
		>
			<h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#1e293b' }}>
				Tendencia de Inventario
			</h3>
			<div style={{ display: 'flex', alignItems: 'flex-end', height: `${chartHeight}px`, gap: `${gap}px` }}>
				{data.map((item, index) => {
					const totalHeight = ((item.almacen + item.logistica + item.sucursales) / maxValue) * chartHeight;
					const actualHeight = totalHeight * progress;
					
					return (
						<div
							key={index}
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								flex: 1,
							}}
						>
							<div
								style={{
									position: 'relative',
									height: `${actualHeight}px`,
									width: `${barWidth}px`,
									background: 'linear-gradient(to top, #3b82f6, #1e40af)',
									borderRadius: '8px 8px 0 0',
								}}
							/>
							<div
								style={{
									marginTop: '12px',
									fontSize: '14px',
									color: '#64748b',
									fontWeight: '500',
								}}
							>
								{item.mes}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

// Componente para donut chart simple
function DonutChart({ data, delay = 0 }: { data: typeof distribucionStock; delay?: number }) {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	
	const progress = spring({
		frame: frame - delay,
		fps,
		config: { damping: 15 },
	});

	const total = data.reduce((sum, item) => sum + item.value, 0);
	let currentAngle = -90; // Start from top
	const radius = 80;
	const center = 100;

	return (
		<div
			style={{
				background: 'white',
				borderRadius: '16px',
				padding: '32px',
				border: '1px solid #e2e8f0',
				boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
			}}
		>
			<h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#1e293b' }}>
				Distribución de Stock
			</h3>
			<div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
				<div style={{ position: 'relative', width: `${center * 2}px`, height: `${center * 2}px` }}>
					<svg width={center * 2} height={center * 2} style={{ transform: 'rotate(-90deg)' }}>
						{data.map((item, index) => {
							const percentage = item.value / total;
							const angle = percentage * 360 * progress;
							const endAngle = currentAngle + angle;
							
							const x1 = center + radius * Math.cos((currentAngle * Math.PI) / 180);
							const y1 = center + radius * Math.sin((currentAngle * Math.PI) / 180);
							const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
							const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);
							
							const largeArcFlag = angle > 180 ? 1 : 0;
							
							const pathData = [
								`M ${center} ${center}`,
								`L ${x1} ${y1}`,
								`A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
								'Z'
							].join(' ');
							
							currentAngle = endAngle;
							
							return (
								<path
									key={index}
									d={pathData}
									fill={item.color}
									style={{ opacity: progress }}
								/>
							);
						})}
					</svg>
					<div
						style={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							textAlign: 'center',
						}}
					>
						<div style={{ fontSize: '14px', color: '#64748b' }}>Total</div>
						<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
							{formatNumber(total)}
						</div>
					</div>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
					{data.map((item, index) => (
						<div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
							<div
								style={{
									width: '16px',
									height: '16px',
									borderRadius: '4px',
									backgroundColor: item.color,
								}}
							/>
							<div>
								<div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
									{item.name}
								</div>
								<div style={{ fontSize: '12px', color: '#64748b' }}>
									{formatNumber(item.value)} ({((item.value / total) * 100).toFixed(1)}%)
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// Componente para Sidebar
function Sidebar({ delay = 0 }: { delay?: number }) {
	const frame = useCurrentFrame();
	
	const slideIn = spring({
		frame: frame - delay,
		fps: 30,
		config: { damping: 15 },
	});

	const opacity = interpolate(frame - delay, [0, 30], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div
			style={{
				opacity,
				transform: `translateX(${-50 * (1 - slideIn)}px)`,
				position: 'absolute',
				left: 0,
				top: 0,
				bottom: 0,
				width: '256px',
				background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
				borderRight: '1px solid rgba(255,255,255,0.1)',
				padding: '24px',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{/* Logo y título */}
			<div style={{ marginBottom: '32px' }}>
				<div
					style={{
						width: '40px',
						height: '40px',
						borderRadius: '12px',
						background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						marginBottom: '16px',
					}}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
						<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
						<line x1="1" y1="10" x2="23" y2="10"></line>
					</svg>
				</div>
				<h1 style={{ 
					fontSize: '18px', 
					fontWeight: 'bold', 
					color: 'white',
					marginBottom: '4px'
				}}>
					CardSystem
				</h1>
				<p style={{ 
					fontSize: '12px', 
					color: '#94a3b8',
					margin: 0
				}}>
					Sistema de Inventario
				</p>
			</div>

			{/* Navegación */}
			<nav style={{ flex: 1 }}>
				{[
					{ icon: '📊', label: 'Dashboard', active: true },
					{ icon: '💳', label: 'Balance', active: false },
					{ icon: '📦', label: 'Productos', active: false },
					{ icon: '🚚', label: 'Órdenes', active: false },
					{ icon: '🏪', label: 'Sucursales', active: false },
					{ icon: '📈', label: 'Forecast', active: false },
				].map((item, index) => (
					<div
						key={index}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
							padding: '12px 16px',
							marginBottom: '8px',
							borderRadius: '12px',
							background: item.active ? 'rgba(255,255,255,0.15)' : 'transparent',
							color: item.active ? 'white' : '#cbd5e1',
						}}
					>
						<span style={{ fontSize: '18px' }}>{item.icon}</span>
						<span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
					</div>
				))}
			</nav>

			{/* Usuario */}
			<div style={{ 
				borderTop: '1px solid rgba(255,255,255,0.1)',
				paddingTop: '16px',
				marginTop: 'auto'
			}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
					<div
						style={{
							width: '40px',
							height: '40px',
							borderRadius: '12px',
							background: '#3b82f6',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'white',
							fontWeight: 'bold',
							fontSize: '16px',
						}}
					>
						A
					</div>
					<div>
						<div style={{ 
							fontSize: '14px', 
							fontWeight: '500', 
							color: 'white',
							marginBottom: '2px'
						}}>
							Admin User
						</div>
						<div style={{ 
							fontSize: '12px', 
							color: '#94a3b8',
							margin: 0
						}}>
							Administrador
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Tarjeta de estadística mejorada
function StatCard({ 
	title, 
	value, 
	subtitle, 
	trend,
	color,
	delay = 0 
}: {
	title: string;
	value: string | number;
	subtitle: string;
	trend?: { value: number; label: string };
	color: string;
	delay?: number;
}) {
	const frame = useCurrentFrame();
	
	const slideIn = spring({
		frame: frame - delay,
		fps: 30,
		config: { damping: 12 },
	});

	const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const transform = `translateY(${30 * (1 - slideIn)}px) scale(${0.95 + 0.05 * slideIn})`;

	return (
		<div
			style={{
				opacity,
				transform,
				background: 'white',
				borderRadius: '16px',
				padding: '24px',
				border: '1px solid #e2e8f0',
				boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
			}}
		>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
				<div>
					<div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
						{title}
					</div>
					<div style={{ 
						fontSize: '32px', 
						fontWeight: 'bold', 
						color: '#1e293b',
						lineHeight: 1
					}}>
						{value}
					</div>
					<div style={{ fontSize: '13px', color: '#94a3b8' }}>
						{subtitle}
					</div>
				</div>
				<div
					style={{
						width: '48px',
						height: '48px',
						borderRadius: '12px',
						background: `${color}15`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<div style={{
						width: '24px',
						height: '24px',
						borderRadius: '6px',
						backgroundColor: color,
					}} />
				</div>
			</div>
			{trend && (
				<div style={{ 
					display: 'flex', 
					alignItems: 'center', 
					gap: '8px',
					fontSize: '13px'
				}}>
					<span style={{ 
						color: trend.value > 0 ? '#16a34a' : '#dc2626',
						fontWeight: '500'
					}}>
						{trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
					</span>
					<span style={{ color: '#64748b' }}>{trend.label}</span>
				</div>
			)}
		</div>
	);
}

export function DashboardVideo() {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				background: '#f8fafc',
				fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
				display: 'flex',
			}}
		>
			{/* Sidebar */}
			<Sidebar delay={0} />

			{/* Main Content */}
			<div
				style={{
					flex: 1,
					marginLeft: '256px',
					padding: '32px',
					overflow: 'hidden',
				}}
			>
				{/* Header */}
				<div
					style={{
						marginBottom: '32px',
						opacity: interpolate(frame, [0, 30], [0, 1]),
					}}
				>
					<h1 style={{ 
						fontSize: '32px', 
						fontWeight: 'bold', 
						color: '#1e293b',
						marginBottom: '8px'
					}}>
						Dashboard
					</h1>
					<p style={{ 
						fontSize: '16px', 
						color: '#64748b',
						margin: 0
					}}>
						Bienvenido, <span style={{ fontWeight: '500', color: '#1e293b' }}>Admin User</span>
					</p>
				</div>

				{/* Stats Grid */}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(2, 1fr)',
						gap: '24px',
						marginBottom: '32px',
					}}
				>
					<StatCard
						title="Total Inventario"
						value={formatNumber(resumenData.totalInventario)}
						subtitle="Todas las áreas"
						trend={{ value: 5.2, label: 'vs mes anterior' }}
						color="#3b82f6"
						delay={30}
					/>
					<StatCard
						title="En Almacén"
						value={formatNumber(resumenData.enAlmacen)}
						subtitle="Bóveda + Trabajo"
						color="#0284c7"
						delay={45}
					/>
					<StatCard
						title="En Logística"
						value={formatNumber(resumenData.enLogistica)}
						subtitle="En tránsito"
						color="#ca8a04"
						delay={60}
					/>
					<StatCard
						title="En Sucursales"
						value={formatNumber(resumenData.enSucursales)}
						subtitle="Puntos de venta"
						color="#16a34a"
						delay={75}
					/>
				</div>

				{/* Charts Section */}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '2fr 1fr',
						gap: '24px',
					}}
				>
					<BarChart data={inventarioTendencia} delay={90} />
					<DonutChart data={distribucionStock} delay={120} />
				</div>
			</div>
		</AbsoluteFill>
	);
}