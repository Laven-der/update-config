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
import { getMd5, getDiffData, getData,downloadFile } from "../utils/fileUtil";
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
        host: "",
        port: "",
        database: "",
        username: "",
        password: "",
        tableName: "",
        keyId: "",
        entityName: "",
        moduleName: "",
        replaceContent: [{ content: "", replace: "" }],
        replaceFileName: [{ content: "", replace: "" }],
        path: "",
        nextPath: [{ content: "", replace: "" }],
        urlPath: [],
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
        tableName: [
          {
            required: true,
            message: "The tableName cannot be empty",
            trigger: "blur",
          },
        ],
        keyId: [
          {
            required: true,
            message: "The keyId cannot be empty",
            trigger: "blur",
          },
        ],
        entityName: [
          {
            required: true,
            message: "The entityName cannot be empty",
            trigger: "blur",
          },
        ],
        moduleName: [
          {
            required: true,
            message: "The moduleName cannot be empty",
            trigger: "blur",
          },
        ],
        // replaceContent: [
        //   {required: true, validator: contentRule, trigger: 'blur'}
        // ],
        // replaceFileName: [
        //   {required: true, validator: contentRule, trigger: 'blur'}
        // ],
        path: [{ required: true, validator: pathReg, trigger: "blur" }],
        nextPath: [{ required: true, validator: pathRule, trigger: "blur" }],
      },
      updateText:"",
      moduleList: [
        { title: "普通", code: 1 },
        { title: "表单", code: 2 },
        { title: "饰品明细", code: 4 },
        { title: "SKU", code: 8 },
      ],
      moduleNameList: [],
      progress: 0,
      size: 0,
      moduleType: 1,
      specialContent: "", // 特殊替换内容
      baseUrl: "https://cs.mclon.com",
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
    let _formItem = localStorage.getItem("formItem");
    let _single = localStorage.getItem("single");
    let _isNextPath = localStorage.getItem("isNextPath");
    let _moduleNameList = localStorage.getItem("moduleNameList");
    if (_formItem) this.formItem = JSON.parse(_formItem);
    if (_single !== null) this.single = _single === "true";
    if (_isNextPath !== null) this.isNextPath = _isNextPath === "true";
    if (_moduleNameList !== null)
      this.moduleNameList = JSON.parse(_moduleNameList);
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
      // if (!this.formItem.host
      //     || !this.formItem.database
      //     || !this.formItem.password
      //     || !this.formItem.username
      //     || !this.formItem.port
      //     ) {
      //   return this.$Message.error({
      //     content: '数据库基本信息不正确，请检查！',
      //     duration: 10,
      //     closable: true
      //   })
      // }
      // if (!this.formItem.replaceContent[0].content) {
      //   return this.$Message.error({
      //     content: "文件替换内容信息不正确，请检查！",
      //     duration: 10,
      //     closable: true,
      //   });
      // }
      // if (this.isNextPath && !this.formItem.nextPath[0].content) {
      //   return this.$Message.error({
      //     content: "下级路径信息不正确，请检查！",
      //     duration: 10,
      //     closable: true,
      //   });
      // }
      // // 验证模版文件位置是否正确
      // if (!fs.existsSync(this.formItem.modulePath)) {
      //   return this.$Message.error({
      //     content: "模版文件路径不存在，请检查！",
      //     duration: 10,
      //     closable: true,
      //   });
      // }

      // console.log(this.formItem);
      // const createFloderBack = await this.createFloder(this.formItem.path);
      // if (!createFloderBack) {
      //   return this.$Message.error({
      //     content: "生成文件路径错误，请检查！",
      //     duration: 10,
      //     closable: true,
      //   });
      // }

      // // 调用接口生成文件
      // if (this.single) {
      //   if (!this.baseUrl) {
      //     return;
      //     this.$Message.error({
      //       content: "接口调用地址错误！",
      //       duration: 10,
      //       closable: true,
      //     });
      //   }
      //   this.specialContent = "";
      //   await this.createFile();
      // }

      // if (this.isCreateFile) {
      //   this.createModuleFile();
      // }
      // if (!this.single && !this.isCreateFile) {
      //   return;
      //   this.$Message.info({
      //     content: "未选择生成文件选项！",
      //     duration: 10,
      //     closable: true,
      //   });
      // }

      // this.saveHistoryData();
      // D:\update\BIMLauncher\
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
    openFileHandler() {
      // const { shell } = require("electron").remote;
      // shell.showItemInFolder("D:CloudMusic");
      const { dialog } = require("electron").remote;
      let self = this;

      dialog.showOpenDialog(
        {
          properties: ["openFile", "openDirectory"],
        },
        function (a, b) {
          self.formItem.bimPath = a[0];
          console.log(a,  self.formItem.bimPath);

        }
      );
      console.log(dialog.showOpenDialog);
    },
    showModalHandler() {
      const { dialog } = require("electron").remote;
      let self = this;
      dialog.showOpenDialog(function (a, b) {
        console.log(a, b);
        self.formItem.startPathFile = a[0];
      });
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
        }).then((itemSize) => {
          self.progress += itemSize;
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
    // 创建模版文件并替换
    createModuleFile() {
      const fileNames = [];
      const temFileNames = fs.readdirSync(this.formItem.modulePath);
      // 模版文件下的模版文件名
      temFileNames.forEach((item) => {
        if (item.indexOf(this.formItem.modulePathFile) !== -1) {
          fileNames.push(item);
        }
      });
      if (fileNames.length === 0) {
        return this.$Message.error({
          content: "没有匹配到文件，请检查！",
          duration: 10,
          closable: true,
        });
      }
      fileNames.forEach(async (item) => {
        const content = fs.readFileSync(
          this.formItem.modulePath + item,
          "utf-8"
        );
        // 获取模版文件的内容,并修改
        let newContent = content;
        this.formItem.replaceContent.forEach((item) => {
          newContent = newContent.replace(
            new RegExp(item.content, "g"),
            item.replace
          );
        });
        newContent = newContent.replace(
          new RegExp("fileUtilVersion", "g"),
          this.version
        );
        // 接口文件替换
        if (this.specialContent !== "") {
          newContent = newContent.replace(
            new RegExp("__REPLACE_CONTENT", "g"),
            this.specialContent
          );
        }
        if (!this.isNextPath) {
          fs.writeFileSync(
            `${this.formItem.path}${item.replace(
              this.formItem.replaceFileName[0].content,
              this.formItem.replaceFileName[0].replace
            )}`,
            newContent,
            (res) => {
              console.log(res);
            }
          );
        } else {
          //
          // 精确匹配
          const result = this.formItem.nextPath.filter((ele) => {
            // return item.indexOf(ele.content) !== -1
            return item == ele.content + ".java" && ele.checked;
          });
          if (result.length !== 0) {
            for (let i = 0; i < result.length; i++) {
              const createFloderBack = await this.createFloder(
                this.formItem.path + result[i].replace
              );
              if (!createFloderBack) {
                return this.$Message.error({
                  content: "文件路径错误，请检查！",
                  duration: 10,
                  closable: true,
                });
              }
              fs.writeFileSync(
                `${this.formItem.path + result[i].replace}${item.replace(
                  this.formItem.replaceFileName[0].content,
                  this.formItem.replaceFileName[0].replace
                )}`,
                newContent,
                (res) => {
                  console.log(res);
                }
              );
            }
          }
          // else {
          //   // 未匹配到按照原先的
          //   fs.writeFileSync(`${this.formItem.path}${item.replace(this.formItem.replaceFileName[0].content, this.formItem.replaceFileName[0].replace)}`, newContent, (res) => {
          //     console.log(res);
          //   })
          // }
        }
      });
    },
    // 创建文件夹
    createFloder(path) {
      return new Promise((resolve, reject) => {
        // 生成路径
        if (plat == "darwin") {
          const hierarchyFolder = path.split("/").filter((d) => d);
          if (fs.existsSync(path)) {
            return resolve(true);
          } else {
            if (!fs.existsSync(`/${hierarchyFolder[0]}`)) {
              return resolve(false);
            } else {
              let temPath = "";
              hierarchyFolder.forEach((item) => {
                temPath += `/${item}`;
                if (!fs.existsSync(temPath)) {
                  fs.mkdirSync(temPath);
                }
              });
              resolve(true);
            }
          }
        } else {
          const hierarchyFolder = path.split("\\").filter((d) => d);
          if (fs.existsSync(path)) {
            return resolve(true);
          } else {
            console.log(hierarchyFolder[0]);
            if (!fs.existsSync(`${hierarchyFolder[0]}`)) {
              return resolve(false);
            } else {
              let temPath = "";
              hierarchyFolder.forEach((item) => {
                temPath += `${item}\\`;
                if (!fs.existsSync(temPath)) {
                  fs.mkdirSync(temPath);
                }
              });
              resolve(true);
            }
          }
        }
      });
    },
    // 通过接口获取创建文件内容，并创建
    createFile() {
      return new Promise((resolve, reject) => {
        const params = {
          host: this.formItem.host,
          port: this.formItem.port,
          database: this.formItem.database,
          username: this.formItem.username,
          password: this.formItem.password,
          tableName: this.formItem.tableName,
          keyId: this.formItem.keyId,
          entityName: this.formItem.entityName,
          moduleName: this.formItem.moduleName,
          operate: this.moduleType,
        };
        this.$http({
          url: `${this.baseUrl}/config/develop/getModel`,
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          data: qs.stringify({ jsonObject: encodeURI(JSON.stringify(params)) }),
        }).then(async (res) => {
          if (res.data.status === "00000") {
            const files = res.data.t;
            if (this.formItem.urlPath.length !== 0) {
              await this.urlCreateFile(
                files,
                `${this.formItem.path}${this.formItem.urlPath[0].replace}`
              );
              resolve();
            } else {
              await this.urlCreateFile(files, this.formItem.path);
              resolve();
            }
          }
        });
      });
    },
    // 根据接口返回生成文件
    async urlCreateFile(data, path) {
      const createFloderBack = await this.createFloder(path);
      if (!createFloderBack) {
        return this.$Message.error({
          content: "文件路径错误，请检查！",
          duration: 10,
          closable: true,
        });
      }
      if (data) {
        for (let item in data) {
          fs.writeFileSync(`${path}${item}.java`, data[item].entityContent);
          // 单个
          this.specialContent = data[item].columnsContent;
        }
      }
    },
    resetForm(name) {
      this.$refs[name].resetFields();
      this.$refs.nextPath.resetForm();
      this.$store.dispatch("Test/someAsyncTask", {});
      localStorage.clear();
    },
    saveHistoryData() {
      localStorage.setItem("formItem", JSON.stringify(this.formItem));
      localStorage.setItem("single", this.single);
      localStorage.setItem("isNextPath", this.isNextPath);
      localStorage.setItem(
        "moduleNameList",
        JSON.stringify(this.moduleNameList)
      );
    },
    readJson() {
      if (this.isNextPath) {
      }
    },
    // 数据库基本信息
    openSqlModal() {
      this.sqlShow = true;
    },
    sqlCancel(e) {
      this.sqlShow = false;
    },
    sqlInfo(data) {
      Object.assign(this.formItem, data);
      this.baseUrl = data.url;
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
    setDefaultValue() {
      let _obj = {
        modulePathFile: "",
        host: "",
        port: "",
        database: "",
        username: "",
        password: "",
        tableName: "",
        keyId: "",
        entityName: "",
        moduleName: "",
        replaceContent: [{ content: "", replace: "" }],
        replaceFileName: [{ content: "", replace: "" }],
        path: "",
        nextPath: [{ content: "", replace: "" }],
        urlPath: [],
      };
      Object.assign(this.formItem, _obj);
      const _tem = this.$store.state.Test.defaultConfig;
      if (_tem.templateFileSuffix) {
        this.formItem.modulePathFile = _tem.templateFileSuffix;
      }
      if (_tem.tableName) {
        this.formItem.tableName = _tem.tableName;
      }
      if (_tem.keyId) {
        this.formItem.keyId = _tem.keyId;
      }
      if (_tem.entityName) {
        this.formItem.entityName = _tem.entityName;
      }
      if (_tem.moduleNames) {
        this.moduleNameList = _tem.moduleNames;
      }
      if (_tem.createFilePath) {
        this.formItem.path = _tem.createFilePath;
      }
      if (_tem.createFileNextPathFlag) {
        this.isNextPath = _tem.createFileNextPathFlag;
      }
      this.$refs.sql.setDefaultValue();
      this.$refs.rep.setDefaultValue();
      this.$refs.nextPath.setDefaultValue();
    },
    // 文件内容替换 组件
    openFileModal() {
      this.fileShow = true;
    },
    fileCancel() {
      this.fileShow = false;
    },
    replaceInfo(data) {
      Object.assign(this.formItem, data);
    },
    // 下级目录 组件
    openPathModal() {
      this.pathShow = true;
    },
    pathCancel() {
      this.pathShow = false;
    },
    pathInfo(data) {
      console.log(data);
      Object.assign(this.formItem, data);
    },
    // 根据表名替换主键、实体名
    refreshModule() {
      if (this.formItem.moduleName === "") {
        this.$Message.error({
          content: "模块名不能为空！",
          duration: 10,
          closable: true,
        });
      }
      const tableName = this.formItem.tableName;
      const _temArr = tableName.split("_");
      // 实体主键
      const _resultArr = _temArr.reduce((acc, cur, index) => {
        index !== 0
          ? acc.push(cur.replace(/^\S/, (s) => s.toUpperCase()))
          : acc.push(cur);
        return acc;
      }, []);
      this.formItem.keyId = _resultArr.join("") + "Id";

      // 实体名
      const _resultArr_1 = _temArr.reduce((acc, cur) => {
        acc.push(cur.replace(/^\S/, (s) => s.toUpperCase()));
        return acc;
      }, []);
      this.formItem.entityName = _resultArr_1.join("");
      this.$refs.nextPath.setNewValue(this.formItem.moduleName);
    },
    // 重写config.json
    coverConfig() {
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
          const content = JSON.parse(
            fs.readFileSync(this.formItem.modulePath + "config.json", "utf-8")
          );
          console.log(content);
          content.createFileNextPathFlag = this.isNextPath;
          // content.createFileNextPaths = this.formItem.nextPath;
          content.createFilePath = this.formItem.path;
          // content.createUrlFileNextPaths = this.formItem.urlPath;
          content.entityName = this.formItem.entityName;
          content.generateEntityFlag = this.single;
          content.host = this.formItem.host;
          content.keyId = this.formItem.keyId;
          content.password = this.formItem.password;
          content.replaceContents = this.formItem.replaceContent;
          content.replaceFileNames = this.formItem.replaceFileName;
          content.tableName = this.formItem.tableName;
          content.templateFileSuffix = this.formItem.modulePathFile;
          content.username = this.formItem.username;
          // this.$store.dispatch('Test/someAsyncTask', JSON.parse(content))
          // this.setDefaultValue()
          fs.writeFileSync(
            this.formItem.modulePath + "config.json",
            JSON.stringify(content),
            (res) => {
              console.log(res);
            }
          );
          this.$Message.success({
            content: "更新成功！",
            duration: 10,
            closable: true,
          });
        }
      });
      // console.log(this.formItem)
    },
  },
};
</script>
<style lang="less">
    .demo-Circle-custom{
        & h1{
            color: #3f414d;
            font-size: 28px;
            font-weight: normal;
        }
        & p{
            color: #657180;
            font-size: 14px;
            margin: 10px 0 15px;
        }
        & span{
            display: block;
            padding-top: 15px;
            color: #657180;
            font-size: 14px;
            &:before{
                content: '';
                display: block;
                width: 50px;
                height: 1px;
                margin: 0 auto;
                background: #e0e3e6;
                position: relative;
                top: -15px;
            };
        }
        & span i{
            font-style: normal;
            color: #3f414d;
        }
    }
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