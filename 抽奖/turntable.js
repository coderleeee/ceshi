export default class Turntable {
	//定义私有属性
	#elemBgImg;
	#elemPointerImg;
	#bgImgCanvas;
	#pointerImgCanvas;
  #goods=[];
	#pointerDeg = 0;
	#mode = 0;
  #animing = false;
	/**
	 * 构造函数
	 * */
	constructor(e){
		const { document } = e.window;
		// 获取占位元素（盒子）
		const elemBox = document.getElementById(e.elemId);
		// 创建元素
		const elemBgImg = document.createElement('img');
		const elemPointerImg = document.createElement('img');
		const size = elemBox.offsetWidth;
		// 设置元素样式
		elemBox.style.display = 'inline-block';
		elemBox.style.position = 'relative';
		elemBgImg.style.transform = `rotate(0deg)`;
		elemBgImg.style.pointerEvents = 'none';//屏蔽触摸点击
		elemPointerImg.style.pointerEvents = 'none';
		elemBgImg.style.position = 'absolute';
		elemPointerImg.style.position = 'absolute';
		elemPointerImg.style.margin = 'auto';
		elemBgImg.style.margin = 'auto';
		elemBgImg.style.left = 0;
		elemBgImg.style.top = 0;
		elemBgImg.style.right = 0;
		elemBgImg.style.bottom = 0;
		elemPointerImg.style.left = 0;
		elemPointerImg.style.top = 0;
		elemPointerImg.style.right = 0;
		elemPointerImg.style.bottom = 0;
		elemBgImg.width = size;
		elemBgImg.height = size;
		elemPointerImg.width = size*0.3;
		elemPointerImg.height = size*0.3;
		//将元素添加到占位元素（盒子）组件中
		elemBox.appendChild(elemBgImg);
		elemBox.appendChild(elemPointerImg);
		this.#elemBgImg = elemBgImg;
		this.#elemPointerImg = elemPointerImg;
		//转盘
		const bgImgCanvas = document.createElement('canvas');
		bgImgCanvas.width = size;
		bgImgCanvas.height = size;
		this.#bgImgCanvas = bgImgCanvas;
		//指针
		const pointerImgCanvas = document.createElement('canvas');
		pointerImgCanvas.width = elemPointerImg.width;
		pointerImgCanvas.height = elemPointerImg.height;
		this.#pointerImgCanvas = pointerImgCanvas;
	}
	/**
	 * 销毁
	 * */
	destory(){
		this.#bgImgCanvas.remove();
		this.#pointerImgCanvas.remove();
	}
	/**
	 * 绘制转盘组件
	 * */
	draw(config){
		const data = {
			padding: 5,//组件内边距
			goods: ['#f00','#0f0','#00f'],//默认三基色填充礼品区
			pointerColor: '#fa0',//指针色
			borderWidth: 10,//边框大小
			borderColor: '#fa0',//边框色
			imgSize: 40,//礼品图片大小
			mode:0,//工作模式： 0：转动转盘；1：转动指针
		};
		Object.assign(data,config);
		this.#mode = data.mode==0 ? 0 : 1;
		const bgImgCanvas = this.#bgImgCanvas;
		const bgImgCtx = bgImgCanvas.getContext('2d');
		const coodrinte = {
			padding: data.padding,
			r: bgImgCanvas.width/2-data.padding
		};
		coodrinte.centerO = coodrinte.padding + coodrinte.r;
		//先绘制转盘底座
		bgImgCtx.strokeStyle = data.borderColor;
		bgImgCtx.lineWidth = data.borderWidth;
		bgImgCtx.fillStyle = '#eee';
		bgImgCtx.beginPath();
		bgImgCtx.arc(coodrinte.centerO,coodrinte.centerO,coodrinte.r,0,Math.PI*2);
		bgImgCtx.fill();
		bgImgCtx.stroke();
		//再绘制转盘上的
		bgImgCtx.strokeStyle = 'rgba(255,255,255,0.3)';
		bgImgCtx.lineWidth = Math.max(1,data.borderWidth/3);
		bgImgCtx.textAlign = 'center';
		const r = coodrinte.r-bgImgCtx.lineWidth;
		//转盘角度（弧边）
		let startAngle = 0;
		let endAngle = 0;
		data.goods.forEach((item,index)=>{
			let good = {
				proportion: Math.round(1000/data.goods.length)/1000,//默认平分概率
			};
			switch(typeof item){
				case 'string':
					if (item.charAt(0)=='#') good.bgColor=item;
					else good.title=item;
					break;
				case 'object':
					Object.assign(good,item);
					break;
				default:
					throw new Error('定义参数goods有误');
			}
			good.startAngle = startAngle;
			good.endAngle = good.startAngle+Math.PI*2*good.proportion;
			//计算角度
			let angle = (good.endAngle-good.startAngle)/2-Math.PI*0.5+(index*good.proportion*Math.PI*2);
			//余弦函数cosA：表示在一个直角三角形中，∠A（非直角）的邻边与三角形的斜边的比
			let x = Math.cos(angle)*(r/2);
			//正弦函数sinA：表示在一个直角三角形中，∠A（非直角）的对边与三角形的斜边的比
			let y = Math.sin(angle)*(r/2);
			// console.log('angle '+angle, 'x='+x+',y='+y);
			good.center = {
				x:coodrinte.centerO+x,
				y:coodrinte.centerO+y,
			};
			data.goods[index] = good;
			startAngle = good.endAngle;
		});
		//绘制分布在转盘中的图案
		data.goods.forEach((item,index)=>{
			if (item.bgColor){
				bgImgCtx.fillStyle = item.bgColor;
			}
			//画划分的区域(弧边)
			bgImgCtx.beginPath();
			bgImgCtx.moveTo(coodrinte.centerO,coodrinte.centerO);
			bgImgCtx.arc(coodrinte.centerO,coodrinte.centerO,r,item.startAngle-Math.PI*0.5,item.endAngle-Math.PI*0.5);
			bgImgCtx.closePath();
			if (!item.bgColor) {
				bgImgCtx.stroke();
				bgImgCtx.fillStyle = '#f50';
			}else{
			}
			bgImgCtx.fill();
			//是否是转动底盘
			if (this.#mode==0) {
				bgImgCtx.save();
				let cX = item.center.x;
				let cY = item.center.y;
				let angle = Math.round(Math.atan(Math.abs(coodrinte.centerO-cY)/Math.abs(coodrinte.centerO-cX))*180/Math.PI);
				// console.log(index+'. angle > '+angle)
				//TODO: 暂时适配最多7个
				switch(angle){
					case 0:
						if (cX<coodrinte.centerO) angle+=90;
						else angle-=90;
						break;
					case 90:
						angle=0;
						break;
					default:
						if (cX<coodrinte.centerO){
							if (cY<coodrinte.centerO){
								angle+=90;
							}else if (angle<20) {
								angle+=45;
							}else if (angle<38) {
								angle-=25;
							}else if (angle<=40) {
								angle+=10;
							}else if (angle==45) {
						
							}else if (angle<=60) {
								angle-=30;
							}else {
								angle+=10;
							}
						}else{
							if (cY<coodrinte.centerO){
								angle=270-angle;
							}else{
								angle-=90;
							}
						}
				}
				if (angle!=0){
					//旋转角度，以转盘中心点对齐
					angle=Math.PI*(angle/180);
					bgImgCtx.translate(cX,cY);
					bgImgCtx.rotate(angle);
					bgImgCtx.translate(-cX,-cY);
				}
			}
			if (item.image) {
				bgImgCtx.drawImage(item.image,item.center.x-data.imgSize*0.5,item.center.y-data.imgSize*0.5,data.imgSize,data.imgSize);
			}
			if (item.title) {
				bgImgCtx.fillStyle = '#fff';
				bgImgCtx.fillText(item.title,item.center.x,item.image ? (item.center.y+data.imgSize*0.9) : item.center.y);
			}
			if (this.#mode==0){
				bgImgCtx.restore();
			}
			//画辅助线
			// bgImgCtx.beginPath();
			// bgImgCtx.moveTo(coodrinte.centerO,coodrinte.centerO);
			// bgImgCtx.lineTo(item.center.x,item.center.y);
			// bgImgCtx.stroke();
			
		});
		this.#goods = data.goods;
		this.#elemBgImg.src = bgImgCanvas.toDataURL();
		//绘制指针
		const pointerImgCanvas = this.#pointerImgCanvas;
		const pointerImgCtx = pointerImgCanvas.getContext('2d');
		
		const pointerData = {
			r: pointerImgCanvas.width/2
		};
		pointerData.r1 = pointerData.r*0.36;
		pointerData.r2 = pointerData.r*0.60;
		
		pointerImgCtx.fillStyle = data.pointerColor;
		startAngle = Math.PI*1.58;
		endAngle = startAngle + Math.PI*1.86;
		pointerImgCtx.lineWidth = 2;
		pointerImgCtx.beginPath();
		pointerImgCtx.arc(pointerData.r,pointerData.r,pointerData.r2,startAngle,endAngle);
		pointerImgCtx.lineTo(pointerData.r,0);
		pointerImgCtx.closePath();
		pointerImgCtx.fill();
		pointerImgCtx.stroke();
		//将绘制的图形设置到图片元素
		this.#elemPointerImg.src = pointerImgCanvas.toDataURL();
	}	
	/**
	 * 开始抽奖
	 * */
    onStart(config){
      if (this.#animing) return;//防止双击(误操作)
      this.#animing = true;
      const data = {
        minRotationNum: 3,//至少转动圈数
        duration:3,//转动耗时3s
        success(res){},//结束时回调
        index: -1,//抽得预定奖品，默认随机
      };
      Object.assign(data,config);
      const goods = this.#goods;
      if (data.index< 0 || data.index>=goods.length) {
        //抽得随机奖品
        data.index = 6;
      }
      const elemActive = this.#mode==0 ? this.#elemBgImg : this.#elemPointerImg;
      const style = elemActive.style;
      const pointerDeg = this.#pointerDeg;
      const index = data.index;
      //定义动画结束监听
      const listener = (event) => {
        event.preventDefault();
        elemActive.removeEventListener('transitionend', listener);
        //重置动画样式
        style.transition = 'none';
        style.transform = `rotate(${this.#pointerDeg}deg)`;
        //结束和回调
        this.#animing = false;
        data.success({
          goods,
          index
        });
      };
      elemActive.addEventListener('transitionend', listener, false);
      //处理过渡动画
      let inDeg = Math.round(goods[index].startAngle/Math.PI*180);
      let outDeg = Math.round(goods[index].endAngle/Math.PI*180);
      let deg = (Math.round(Math.random()*(outDeg-inDeg)))+inDeg;
      // console.log('rand '+index, `${inDeg}°~${outDeg}° ${deg}° current:${pointerDeg}`);
      //转盘是反向旋转的
      if (this.#mode==0) deg = 360-deg;
      deg += (Math.round(Math.random()*10)+data.minRotationNum)*360;
      //简化角度
      this.#pointerDeg = deg%360;
      //修改完样式，就可开始动画
      style.transition = `all ${data.duration}s ease-out`;
      style.transform = `rotate(${deg}deg)`;
    }
}
