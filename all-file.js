const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require("@babel/core");
const excelPort = require('excel-export');

// node xx.js args
const args = process.argv.slice(2)[0]
let AllMultiArr = [], AllMultiKeytoVal = {}

/**
 * 遍历指定目录下的所有文件
 * @param {*} dir 
 */
const getAllFile=function(dir){
    let res=[]
    function traverse(dir){
        fs.readdirSync(dir).forEach((file)=>{
            const pathname=path.join(dir,file)
            if(fs.statSync(pathname).isDirectory()){
                traverse(pathname)
            }else{
                res.push(pathname)
            }
        })
    }
    traverse(dir)
    return res;
}

const getAllMultiJson = () => {
    const filsPathArr = getAllFile(args)
    filsPathArr.map(item => {
        getFilesContent(item)
    })

    Object.keys(AllMultiKeytoVal).map(key=>{
        AllMultiArr.push({
            'key': key,
            'en': AllMultiKeytoVal[key].en,
            'zh': AllMultiKeytoVal[key].zh,
        })
    })
    return AllMultiArr
}

const formatJson = (str)=> {
    str = `${str}`
    // mutiObj=  mutiObj.replace(/\./g,'-')
    // str = str.replace(/ /g,'')
    str = str.replace(/"/g,'')
    str = str.replace(/\r\n/g,'')
    str = str.replace(/\'/g,'"')

    return str
}

const getFilesContent = (filePath)=> {
    console.log(filePath)
    let content = fs.readFileSync(filePath, "utf-8")
    let mutiObj = content.slice(content.indexOf('{'),content.lastIndexOf('}')+1) + ''
    let mutilArrKeys = []

    mutiObj = formatJson(mutiObj)

    let lastClose = mutiObj.lastIndexOf('}')
    let lastSeci = mutiObj.lastIndexOf(',')

    if(lastClose - lastSeci == 1) {
        mutiObj = mutiObj.slice(0, lastSeci) + mutiObj.slice(lastSeci+1);
    }
    console.log('-------mutiObj-------',mutiObj)
    mutiObj = JSON.parse(mutiObj)
    mutilArrKeys = Object.keys(mutiObj)

    mutilArrKeys.map(key => {
        if(!AllMultiKeytoVal.hasOwnProperty(key)) {
            AllMultiKeytoVal[key] = {}
        }
        if(filePath.indexOf('en-US') > 0) {
            AllMultiKeytoVal[key]['en'] = mutiObj[key]
        } else if (filePath.indexOf('zh-CN') > 0) {
            AllMultiKeytoVal[key]['zh'] = mutiObj[key]
        }
    })
}

// 导出多语言excel
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
        width: 50, // 宽度
    })
    }
    // 内容
    datas.forEach(item => {
    // 解构
    const { key, en, zh } = item
    excelConf.rows.push([key, zh, en])
    })
    // 调用excelPort的方法，生成最终的数据
    const result = excelPort.execute(excelConf);
    // 写文件
    fs.writeFile('./psi-mutiligual.xlsx', result, 'binary', err => {
    if(!err){
        console.log('生成成功！')
    }
    })
}

generateExcel(getAllMultiJson());



