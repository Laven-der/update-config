<template>
  <div id="app">
    <Layout>
            <Header :style="{position: 'fixed', width: '100%'}">
                <Menu mode="horizontal" theme="dark" active-name="1">
                    <div class="layout-logo"></div>
                    <div class="layout-nav">
                        <MenuItem name="1" to="/">
                            <Icon type="ios-navigate"></Icon>
                           基本设置
                        </MenuItem>
                        <MenuItem name="2" to="/setting">
                            <Icon type="ios-keypad"></Icon>
                           软件配置
                        </MenuItem>
                        <MenuItem name="3" to="/setting">
                            <Icon type="ios-analytics"></Icon>
                           环境设置
                        </MenuItem>
                        <MenuItem name="4">
                            <Icon type="ios-paper"></Icon>
                           更新配置
                        </MenuItem>
                    </div>
                </Menu>
            </Header>
            <Content :style="{margin: '88px 20px 0', background: '#fff', minHeight: '500px'}">
                  <router-view></router-view>
            </Content>
            <Footer class="layout-footer-center">2011-2016 &copy; TalkingData</Footer>
        </Layout>
 
    <update-modal></update-modal>
  </div>
</template>

<script>
import UpdateModal from './component/updateModal'
  export default {
    name: 'file_tool',
    data() {
      return {
        showUpdater: false,
        downloadProcess: null
      }
    },
    created() {

    },
    components: {
      UpdateModal
    },mounted:{

    },
    methods:{
      selectItem(name){
        console.log(name)
      }
    }
  }
</script>

<style scoped>
.ivu-layout-header{
 z-index: 99;
}
    .layout{
        border: 1px solid #d7dde4;
        background: #f5f7f9;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
       
    }
    .layout-logo{
        width: 100px;
        height: 30px;
        background: #5b6270;
        border-radius: 3px;
        float: left;
        position: relative;
        top: 15px;
        left: 20px;
    }
    .layout-nav{
        width: 500px;
        margin: 0 auto;
        margin-right: 20px;
    }
    .layout-footer-center{
        text-align: center;
    }
  /* CSS */
  .vertical-center-modal {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .vertical-center-modal .ivu-modal{
      top: 0;
    }
    .header{
      height: 48px;
      background: #FFA800;
    }
</style>
