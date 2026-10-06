// Images sent to AI are smaller copies; original files remain available for teacher review.
function event(target:EventTarget,name:string,timeout=15000){return new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>finish(new Error('媒体解码超时')),timeout);const ok=()=>finish(),bad=()=>finish(new Error('浏览器无法解码此媒体'));function finish(error?:Error){clearTimeout(timer);target.removeEventListener(name,ok);target.removeEventListener('error',bad);error?reject(error):resolve()}target.addEventListener(name,ok,{once:true});target.addEventListener('error',bad,{once:true})})}
async function frame(source:CanvasImageSource,width:number,height:number){const canvas=document.createElement('canvas');const scale=Math.min(1,1024/Math.max(width,height));canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));canvas.getContext('2d')!.drawImage(source,0,0,canvas.width,canvas.height);return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('无法生成分析图片')),'image/jpeg',.82))}
export async function evidenceForm(file:File){
  if(!file.size||file.size>20*1024*1024)throw new Error('文件需小于 20MB');
  const form=new FormData();form.append('file',file);const url=URL.createObjectURL(file);const frames:{time:number|null}[]=[];
  try{
    if(file.type.startsWith('image/')){const img=new Image();const loaded=event(img,'load');img.src=url;await loaded;form.append('evidence0',await frame(img,img.naturalWidth,img.naturalHeight),'image.jpg');frames.push({time:null})}
    else if(file.type.startsWith('video/')){const video=document.createElement('video');video.preload='auto';video.muted=true;video.playsInline=true;const loaded=event(video,'loadeddata');video.src=url;await loaded;if(!Number.isFinite(video.duration)||video.duration<=0)throw new Error('视频时长无效');for(let i=0;i<5;i++){const time=video.duration*(.05+i*.225);const seek=event(video,'seeked');video.currentTime=time;await seek;form.append('evidence'+i,await frame(video,video.videoWidth,video.videoHeight),'frame.jpg');frames.push({time})}video.removeAttribute('src');video.load()}
    form.append('frames',JSON.stringify(frames));return form;
  }finally{URL.revokeObjectURL(url)}
}
