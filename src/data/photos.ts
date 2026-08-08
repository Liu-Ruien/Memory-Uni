export interface Photo {
  id: string
  src: string
  alt: string
  title: string
  location: string
  date: string
  accentColor: string
  gridAspect: number
  source: 'archive' | 'local' | 'supabase'
  uploadedAt?: string
}

// 将文件放入 public/photos 后，在此添加一项即可，无需修改组件。
export const photos: Photo[] = [
  { id: 'archive-01', src: '/photos/photo-01.jpg', alt: '晨光中的安静街道', title: '第一束光', location: '京都', date: '2026.03', accentColor: '#d8c8b8', gridAspect: 0.75, source: 'archive' },
  { id: 'archive-02', src: '/photos/photo-02.jpg', alt: '阳光下平静的海岸', title: '海的安静', location: '镰仓', date: '2026.04', accentColor: '#b9cbd1', gridAspect: 0.75, source: 'archive' },
  { id: 'archive-03', src: '/photos/photo-03.jpg', alt: '淡色天空下的春日樱花', title: '春日午后', location: '大阪', date: '2026.04', accentColor: '#d9c4cb', gridAspect: 0.75, source: 'archive' },
  { id: 'archive-04', src: '/photos/photo-04.jpg', alt: '蓝调时刻的雨夜窗景', title: '雨停之后', location: '东京', date: '2026.05', accentColor: '#8fa3b4', gridAspect: 0.75, source: 'archive' },
  { id: 'archive-05', src: '/photos/photo-05.jpg', alt: '暖阳落进安静的室内', title: '下午三点半', location: '首尔', date: '2026.05', accentColor: '#d7b887', gridAspect: 0.75, source: 'archive' },
  { id: 'archive-06', src: '/photos/photo-06.jpg', alt: '薄雾天空下的绿色山坡', title: '慢一点的地方', location: '济州', date: '2026.06', accentColor: '#9eaf9b', gridAspect: 0.75, source: 'archive' },
  { id: 'archive-07', src: '/photos/photo-07.jpg', alt: '傍晚街区亮起的灯光', title: '回家的路', location: '上海', date: '2026.06', accentColor: '#a7948a', gridAspect: 0.75, source: 'archive' },
  { id: 'archive-08', src: '/photos/photo-08.jpg', alt: '窗边摆着杯子的木桌', title: '窗边的位置', location: '台北', date: '2026.07', accentColor: '#c3b79d', gridAspect: 0.75, source: 'archive' },
  { id: 'archive-09', src: '/photos/photo-09.jpg', alt: '消失在夏日云雾中的山脊', title: '走进雾里', location: '大理', date: '2026.07', accentColor: '#aebbb8', gridAspect: 0.75, source: 'archive' },
]
