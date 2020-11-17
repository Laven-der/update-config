<template>
  <div class="home">
    <Form
      ref="formItem"
      :model="formItem"
      :rules="formValidate"
      label-position="left"
      :label-width="150"
    >
      <FormItem
        label="软件目录"
        prop="modulePath"
      >
        <Input
          type="text"
          v-model="formItem.bimPath"
          clearable
        />
        <Button
          type="info"
          @click="openFileHandler"
        >选择目录</Button>
      </FormItem>
      <FormItem
        label="启动文件路径"
        prop="startPathFile"
      >
        <Input
          type="text"
          v-model="formItem.startPathFile"
          clearable
        />
        <Button
          type="info"
          @click="showModalHandler"
        >选择文件</Button>
      </FormItem>
      <FormItem
        label="配置文件路径"
        prop="modulePath"
      >
        <Input
          type="text"
          v-model="formItem.modulePath"
          clearable
        />
        <Button
          type="info"
          @click="showModalHandler"
        >选择文件</Button>
      </FormItem>
     
    
    </Form>
         <p>{{updateText}}</p>
          <Progress
        :percent="percent"
        :stroke-width="20"
        text-inside
        hide-info
      />
      <!-- <Circle
        :size="250"
        :trail-width="4"
        :stroke-width="5"
        :percent="percent"
        stroke-linecap="square"
        stroke-color="#43a3fb">
        <div class="demo-Circle-custom">
            <h1>42,001,776</h1>
            <p>{{updateText}}</p>
            <span>
                进度
                <i>{{percent}}%</i>
            </span>
        </div>
    </Circle> -->
    <div class="home-btn">
      <Button
        type="primary"
        @click="createClassFile('formItem')"
      >保存</Button>
      <Button
        type="primary"
        @click="openProduct('formItem')"
      >打开</Button>
      <Button
        style="margin-left: 10px"
        @click="resetForm('formItem')"
      >重置</Button>
    </div>
  </div>
</template>
<script>
import fs from "fs";
import qs from "querystring";
import path from "path";
import { resolve } from "url";
import { getMd5, getDiffData, getData,downloadFile,openFileHandler } from "../utils/fileUtil";
import confJson from "../../../static/conf.json";
let plat = "";
export default {
  name: "home-page",
  data() {
    // 路径正则验证
    const pathReg = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("路径不能为空！"));
      } else if (!(/^\/.*\/$/.test(value) || /^[CDEF]:.*\\$/.test(value))) {
        return callback(
          new Error(
            "路径格式不正确，例如 Mac(/D/test/)--- Windows(C:\\Users\\DSHui\\Desktop\\)"
          )
        );
      } else {
        callback();
      }
    };
    // 下级路径验证
    const pathRule = (rule, value, callback) => {
      const result = value.every((item) => {
        return item.content !== "" && item.replace !== "";
      });
      if (!result) {
        return callback(new Error("下级路径不能为空！"));
      } else {
        callback();
      }
    };

    return {
      formItem: {
        bimPath:"",
        modulePath: "",
        modulePathFile: "",
        startPathFile: "C:\\Users\\Administrator\\Desktop\\云骑士装机大师.exe",
      },
      formValidate: {
        modulePath: [{ required: true, validator: pathReg, trigger: "blur" }],
        startPathFile: [
          { required: true, validator: pathReg, trigger: "blur" },
        ],
        modulePathFile: [
          {
            required: true,
            message: "模版文件匹配的字段不能为空！",
            trigger: "blur",
          },
        ],
      },
      updateText:"",
      progress: 0,
      size: 0,
      moduleType: 1,
    };
  },
  computed: {
    percent() {
      if (this.progress == 0) return 0;
      console.log(this.progress,this.size)
      return (Math.round(this.progress / this.size * 10000) / 100)
    },
  },
  mounted() {
    plat = process.platform;
  },
  methods: {
    // 生成文件
    async createClassFile(name) {
      // 验证
      console.log(this.formItem, this.version);
      const formResult = await this.$refs[name].validate();
      console.log(formResult);
      const { modulePath } = this.formItem;
      if (!formResult) return;
      let pathUrl = path.resolve(__dirname, modulePath + "test.js");
      fs.unlink(pathUrl, (err) => {
        console.log("删除完成");
      });
      this.$Message.success({
        content: "实体类生成成功！",
        duration: 10,
        closable: true,
      });
    },
   async openFileHandler() {
      // const { shell } = require("electron").remote;
      // shell.showItemInFolder("D:CloudMusic");
    this.formItem.bimPath = await openFileHandler(false)
    },
    async showModalHandler() {
      this.formItem.startPathFile = await openFileHandler()
    },
    onProgress(itemSize){
       this.progress = itemSize;
    },
    async openProduct() {
      // var s= await getMd5(this.formItem.startPathFile)
      // console.log(s)
      var start = new Date().getTime();
      const self = this;
            this.updateText="检查更新文件...."
      const { size, updateData } = await getDiffData(confJson,this.formItem.bimPath);

      this.size = size;
      // getData(updateData)
      updateData.map((item) => {
        downloadFile({
          remoteFile: item.url,
          name: item.name,
          size: item.size,
          localFile: `${self.formItem.bimPath}${item.pathWithName}`,
          onProgress:self.onProgress
        }).then((itemSize) => {
          // self.progress = itemSize;
          self.updateText="开始更新"
             console.log(
                    (new Date().getTime() - start) / 1000.0 +
                    "秒" );
        });
      });
      console.log(
        "比对md5耗时:" +
          (new Date().getTime() - start) / 1000.0 +
          "秒，预计更新" +
          updateData.length +
          "个文件"
      );
            this.updateText=
        "比对md5耗时:" +
          (new Date().getTime() - start) / 1000.0 +
          "秒，预计更新" +
          updateData.length +
          "个文件"
      // var cp = require("child_process"); //子进程
      // var path = ""; //第三方根目录
      // cp.exec(this.formItem.startPathFile, function (error, stdout, stderr) {
      //   console.log("error", error);
      //   console.log("stdout", stdout);
      //   console.log("stderr", stderr);
      // });
    },
    resetForm(name) {
      this.$refs[name].resetFields();
      this.$refs.nextPath.resetForm();
      this.$store.dispatch("Test/someAsyncTask", {});
      localStorage.clear();
    },
    // 导入默认配置
    importConfig() {
      this.$refs["formItem"].validateField("modulePath", (info) => {
        if (!info) {
          if (!fs.existsSync(this.formItem.modulePath)) {
            return this.$Message.error({
              content: "文件路径错误，请检查！",
              duration: 10,
              closable: true,
            });
          }
          if (!fs.existsSync(this.formItem.modulePath + "config.json")) {
            return this.$Message.error({
              content: "该文件夹内没有config.json，请检查！",
              duration: 10,
              closable: true,
            });
          }
          const content = fs.readFileSync(
            this.formItem.modulePath + "config.json",
            "utf-8"
          );
          this.$store.dispatch("Test/someAsyncTask", JSON.parse(content));
          this.setDefaultValue();
        }
      });
    },
  },
};
</script>
<style lang="less">
.home {
  padding: 3% 12%;
  max-width: 1000px;
  margin: 0 auto;
  &-btn {
    text-align: center;
  }
}
.next-item {
  margin-left: 150px;
}

.clickStyle {
  font-size: 14px;
}
.ivu-form-item-content {
  display: flex;
  & button {
    margin-left: 10px;
  }
}
.nextPath {
  display: flex;
  justify-content: space-between;
}
.home-btn{
  margin-top: 26px;
}
</style>