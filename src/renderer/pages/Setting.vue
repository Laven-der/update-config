<template>
  <div class="setting">
<div class="row mt-5">
			<div class="col">
				<div class="card">
					<img src="img/4363.jpg" alt="">
					<div class="card-body">
						<h5 class="card-title">
							<a href="#">测试环境-stage</a>
						</h5>
						<p class="date-author">
							2020-05-10 <span class="author">By Abbos</span>
						</p>
						<p class="card-text">
							一个长期存在的事实是，当一个读者看到一个页面的布局时，它就会成为它的读者。
						</p>
					</div>
				</div>
			</div>
	
			<div class="col">
				<div class="card">
					<img src="img/4363.jpg" alt="">
					<div class="card-body">
						<h5 class="card-title">
							<a href="#">alpha2环境</a>
						</h5>
						<p class="date-author">
							2020-05-10 <span class="author">By Abbos</span>
						</p>
						<p class="card-text">
							一个长期存在的事实是，当一个读者看到一个页面的布局时，它就会成为它的读者。
						</p>
					</div>
				</div>
			</div>
		</div>
  </div>
</template>
<script>
export default {
     name: "home-page",
  props: {
   
    icon: {
      type: Boolean,
      default: true
    },
    firstPlaceholder: {
      type: String,
      default: '被替换内容'
    },
    lastPlaceholder: {
      type: String,
      default: '替换内容'
    }
  },
  mounted() {
    
  },
  methods: {
    addItem() {
      this.value.push({
        content: '', replace: ''
      })
    },
    removeItem(i) {
      this.value.splice(i, 1)
    }
  }
}
</script>
<style lang="less" scoped>
.container{
    max-width: 960px;
    margin: 0 auto;
}

.row{
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}

.text-center{
    text-align: center;
    font-size: 18px;
}

.text-center h2{
    font-weight: 500;
    font-size: 1.6em;
}

.text-center h2 span{
    font-weight: 800;
}

.text-center p{
    max-width: 500px;
    margin: 0 auto;
    color: #6c757d;
    line-height: 1.5;
    font-size: 1em;
}

.col{
    width: 33.3333333%;
    overflow: hidden;
    padding: 15px;
}

.col .card{
    width: 100%;
    box-shadow: 0px 0px 20px rgba(0,0,0,0.2);
    transition: transform 0.3s ease;
}

.col img{
    width: 100%;
    height: auto;
    border: 0;
}

.col .card-body{
    padding: 0 15px 15px 15px;
    background-color: #fff;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
}

.card-body h5{
    font-size: 24px;
    margin: 7px 0;
}

.card:hover{
    transform: translateY(-10px);
    transition: transform 0.3s ease;
}

.card p{
    color: #6c757d;
}

.card-body .date-author span{
    color: #e74c3c;
}

.card-body h5 a{
    color: #222;
}

@media(min-width: 577px) and (max-width: 768px){
    .col{
        width: 50%;
    }
}

@media(max-width: 576px){
    .col{
        width: 100%;
    }
}
</style>