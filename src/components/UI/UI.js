import React from'react';import{ArrowUpRight,MoreHorizontal}from'lucide-react';import'./UI.css';
export function Header({eyebrow,title,subtitle,action}){return <div className="ph page"><div><span>{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>}
export function Button({children,kind='primary',onClick,type='button',disabled=false}){return <button type={type} disabled={disabled} onClick={onClick} className={'btn '+kind}>{children}<ArrowUpRight size={14}/></button>}
export function Panel({title,children,action}){return <section className="panel"><div className="panelHead"><h3>{title}</h3>{action||<MoreHorizontal size={17}/>}</div>{children}</section>}
export function Stat({icon,label,value,note,tone='blue'}){return <div className={'stat '+tone+' page'}><div className="statTop"><i>{icon}</i><small>{note}</small></div><span>{label}</span><b>{value}</b></div>}
