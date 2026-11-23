import type { Metadata, Viewport } from 'next';
import './style.css';
export const metadata: Metadata={title:'Sarah AI | سارة',description:'Personal executive assistant prototype',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,statusBarStyle:'black-translucent',title:'Sarah AI'}};
export const viewport: Viewport={themeColor:'#071523',width:'device-width',initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar"><body>{children}</body></html>}