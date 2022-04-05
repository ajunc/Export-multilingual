const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require("@babel/core");
const excelPort = require('excel-export');

const getFilesContent = ()=> {
    const args = process.argv.slice(2)[0]
    let content = fs.readFileSync(args, "utf-8")
    let mutiObj = content.slice(content.indexOf('{'),content.lastIndexOf('}')+1) + ''
    let mutiArr = [], mutilArrKeys = []
    mutiObj = `${mutiObj}`
    // mutiObj=  mutiObj.replace(/\./g,'-')
    // mutiObj=  mutiObj.replace(/ /g,'')
    mutiObj=  mutiObj.replace(/\'/g,'"')

    mutiObj = JSON.parse(mutiObj)
    mutilArrKeys = Object.keys(mutiObj)
    console.log('--mutiObj parse-----: ', typeof mutiObj)

    mutilArrKeys.map(key => {
      mutiArr.push({
        'en': mutiObj[key],
        'zh': mutiObj[key]
      })
    })

    return mutiArr
}
getFilesContent()
    const arrData = getFilesContent()
    // const arrData = [
    //   {
    //     "name": "MacBook Pro",
    //     "size": 13,
    //     "price": 13000,
    //   },
    //   {
    //     "name": "IPhone 7",
    //     "size": 32,
    //     "price": 5000,
    //   },
    //   {
    //     "name": "IPhone 8",
    //     "size": 128,
    //     "price": 8000,
    //   }
    // ];

    const generateExcel = (datas) => {
      /**
       * 定义一个空对象，来存放表头和内容
       * cols，rows为固定字段，不可修改
       */
      const excelConf = {
        cols: [], // 表头
        rows: [], // 内容
      };
      // 表头
      for(let key in datas[0]){
        excelConf.cols.push({
          caption: key,
          type: 'string', // 数据类型
          width: 100, // 宽度
        })
      }
      // 内容
      datas.forEach(item => {
        // 解构
        const { en, zh } = item
        excelConf.rows.push([zh, en])
      })
      // 调用excelPort的方法，生成最终的数据
      const result = excelPort.execute(excelConf);
      // 写文件
      fs.writeFile('./excel.xlsx', result, 'binary', err => {
        if(!err){
          console.log('生成成功！')
        }
      })
    }
    generateExcel(arrData);



