import { Composition, registerRoot } from 'remotion';
import { DashboardVideo } from './DashboardVideo';

// Exportar la composición para que Remotion la reconozca
export const RemotionRoot = () => {
	return (
		<>
			<Composition
				id="DashboardVideo"
				component={DashboardVideo}
				durationInFrames={300} // 10 segundos a 30fps
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};

// Registrar el root para Remotion
registerRoot(RemotionRoot);