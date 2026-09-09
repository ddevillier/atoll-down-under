// One shared GPU surface rasterizes a complete joined mesh in one draw call.
// Cached pose canvases retain their own pixels after this surface is reused.
export class MeshRasterizer{
 constructor(){
  this.canvas=document.createElement('canvas');this.textures=new Map();this.available=false;
  const gl=this.canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:true});
  if(!gl)return;this.gl=gl;
  this.canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.available=false;this.textures.clear();});
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;};
  const vertex=shader(gl.VERTEX_SHADER,'attribute vec2 position; attribute vec2 uv; varying vec2 textureUV; void main(){gl_Position=vec4(position,0.0,1.0);textureUV=uv;}');
  const fragment=shader(gl.FRAGMENT_SHADER,'precision highp float; varying vec2 textureUV; uniform sampler2D painting; void main(){gl_FragColor=texture2D(painting,textureUV);}');
  if(!vertex||!fragment)return;
  const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);return;}
  this.program=program;this.position=gl.getAttribLocation(program,'position');this.uv=gl.getAttribLocation(program,'uv');this.buffer=gl.createBuffer();
  gl.useProgram(program);gl.uniform1i(gl.getUniformLocation(program,'painting'),0);gl.disable(gl.BLEND);gl.disable(gl.DEPTH_TEST);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
  this.available=true;
 }
 render(image,src,dst,cols,rows,width,height){
  if(!this.available||this.gl.isContextLost())return null;
  const gl=this.gl;
  if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
  let texture=this.textures.get(image);
  if(texture){this.textures.delete(image);this.textures.set(image,texture);}
  else{
   texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);this.textures.set(image,texture);
   while(this.textures.size>64){const first=this.textures.keys().next().value;gl.deleteTexture(this.textures.get(first));this.textures.delete(first);}
  }
  const vertices=new Float32Array(cols*rows*6*4);let at=0;
  const emit=i=>{vertices[at++]=dst[i].x/width*2-1;vertices[at++]=1-dst[i].y/height*2;vertices[at++]=src[i].x/image.width;vertices[at++]=src[i].y/image.height;};
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+1,c=a+cols+1,d=c+1;emit(a);emit(b);emit(c);emit(b);emit(d);emit(c);}
  gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.program);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);
  gl.enableVertexAttribArray(this.position);gl.vertexAttribPointer(this.position,2,gl.FLOAT,false,16,0);gl.enableVertexAttribArray(this.uv);gl.vertexAttribPointer(this.uv,2,gl.FLOAT,false,16,8);
  gl.drawArrays(gl.TRIANGLES,0,cols*rows*6);
  return this.canvas;
 }
}
