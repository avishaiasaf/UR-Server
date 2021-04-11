const e = require("express");
const fs = require("fs");
const { isArray } = require("util");
const accessories = require("./accessories.js");

var reportHandler = {
    inputs:{
        bkmvdata: null,
        ini: null,
    },
    outputs:{
        ini_parsed: null,
        bkmvdata_parsed: null,
        tran_dict: {a100:{} ,b100:{}, b110:{}, c100:{}, d110:{}, d120:{}, m100:{}}, 
        tran_ids: null,
        summary_c100: null,  
        summary_d110: null,
        summary_d120: null,
        summary: null,
    },
    rejects:{
        headerError: null,
        summaryError: null,
        headerNegError: null,
        LineError: null,
        JournalError: null,
        vatError: null,
    },
    handlers:{
        //records: {a000:[],a100:0 ,b100:0,b110:0,c100:0,d110:0,d120:0,m100:0,},
    },
    init(){
        //Process header file
        this.processIni(this.ini); 

        //Process body file
        this.processBkmvdata(this.bkmvdata);

        //Test data
        //console.log(this.ini_parsed);
        //console.log(this.bkmvdata_parsed);
        //console.log(this.bkmvdata_parsed.lentgh);

        //Validate report structure
        this.validateReport();
    },
    processIni(input_data){
        var input=input_data.split('\n');  
        var records={a000:[],b100:0,b110:0,c100:0,d110:0,d120:0,m100:0,};

        for(let i=0;i<input.length;i++){
            let type=input[i].substring(0,4);
            
            switch(type){
                case 'A000':    records['a000']=this.processLine(input[i]);           break;
                case 'B100':    records['b100']=parseInt(input[i].substr(4,15));      break;
                case 'B110':    records['b110']=parseInt(input[i].substr(4,15));      break;
                case 'C100':    records['c100']=parseInt(input[i].substr(4,15));      break;
                case 'D110':    records['d110']=parseInt(input[i].substr(4,15));      break;
                case 'D120':    records['d120']=parseInt(input[i].substr(4,15));      break;
                case 'M100':    records['m100']=parseInt(input[i].substr(4,15));      break;
            }
        }
        this.ini_parsed = records;
    },
    processBkmvdata(input_data){
        var input=input_data.split('\n');  
        var records = {a100:[] ,b100:[], b110:[], c100:[], d110:[], d120:[], m100:[]};
        var dict = {a100:{} ,b100:{}, b110:{}, c100:{}, d110:{}, d120:{}, m100:{}};
        var tranIdSet = new Set();
        var summary_c100 = {100: 0, 305: 0, 320:0, 330:0, 400:0, 410:0, 500:0, 700:0, 710:0, 810:0, 820:0, 830:0, 840:0, 900:0, 910:0};
        var summary_d110 = {100: 0, 305: 0, 320:0, 330:0, 400:0, 410:0, 500:0, 700:0, 710:0, 810:0, 820:0, 830:0, 840:0, 900:0, 910:0};
        var summary_d120 = {100: 0, 305: 0, 320:0, 330:0, 400:0, 410:0, 500:0, 700:0, 710:0, 810:0, 820:0, 830:0, 840:0, 900:0, 910:0};

        for(let i=0;i<input.length;i++){
            let type=input[i].substring(0,4);
            let parsedLine = this.processLine(input[i]);

            switch(type){
                case 'A100':    
                    records['a100'].push(parsedLine);
                    break;
                case 'B100':
                    records['b100'].push(parsedLine);
                    break;
                case 'B110':
                    records['b110'].push(parsedLine);
                    break;
                case 'C100':
                    records['c100'].push(parsedLine);
                    if(!dict['c100'][parsedLine['id']])     dict['c100'][parsedLine['id']] = Array.from(parsedLine);
                    else    dict['c100'][parsedLine['id']].push(parsedLine);
                    tranIdSet.add(parsedLine['id']);
                    summary_c100[parsedLine['doctype']]+=parseInt(parsedLine['totalafterdiscount']);
                    break;
                case 'D110':
                    records['d110'].push(parsedLine);
                    if(!dict['d110'][parsedLine['id']])     dict['d110'][parsedLine['id']] = Array.from(parsedLine);
                    else    dict['d110'][parsedLine['id']].push(parsedLine);
                    summary_d110[parsedLine['doctype']]+=parseInt(parsedLine['amount']);
                    break;
                case 'D120':
                    records['d120'].push(parsedLine);
                    if(!dict['d120'][parsedLine['id']])     dict['d120'][parsedLine['id']] = Array.from(parsedLine);
                    else    dict['d120'][parsedLine['id']].push(parsedLine);
                    summary_d120[parsedLine['doctype']]+=parseInt(parsedLine['amount']);
                    break;
                case 'M100':
                    records['m100'].push(parsedLine);
                    break;
            }
        }

        this.bkmvdata_parsed = records;
        this.tran_dict = dict;
        this.tran_ids = Array.from(tranIdSet);
        this.summary_c100 = summary_c100;
        this.summary_d110 = summary_d110;
        this.summary_d120 = summary_d120;
    },
    processLine(line){
        if(!line) return;
        let type = line.substr(0, 4);

        switch(type){
            case 'A000':
                return this.lineParser(line, accessories.fields['A000'], accessories.positions['A000']);
            case 'A100':
                return this.lineParser(line, accessories.fields['A100'], accessories.positions['A100']);
            case 'B100':
                return this.lineParser(line, accessories.fields['B100'], accessories.positions['B100']);
            case 'C100':
                return this.lineParser(line, accessories.fields['C100'], accessories.positions['C100']);
            case 'B110':
                return this.lineParser(line, accessories.fields['B110'], accessories.positions['B110']);
            case 'D110':
                return this.lineParser(line, accessories.fields['D110'], accessories.positions['D110']);
            case 'D120':
                return this.lineParser(line, accessories.fields['D120'], accessories.positions['D120']);
            case 'M100':
                return this.lineParser(line, accessories.fields['M100'], accessories.positions['M100']);
            default:
                return 'Not recognized';
        }
    },
    lineParser(line, fields, positions){
        var tmp={};
        for(let j=0;j<fields.length;j++){
            let space=positions[j+1]-positions[j];
            tmp[fields[j]]=line.substr(positions[j], space).trim().match(/[a-zA-Z]/)==null ? parseInt(line.substr(positions[j], space)) : line.substr(positions[j], space).trim();
        }
        return tmp;
    },
    validateReport(){

        var headerError = new Array();
        var headerNegError = new Array();
        var LineError = new Array();
        var JournalError = new Array();
        var summaryError = new Array();
        var vatError = new Array();
        var c100Len = this.bkmvdata_parsed['c100'].length;
        var d110Len = this.bkmvdata_parsed['d110'].length;
        var d120Len = this.bkmvdata_parsed['d120'].length;
        var b100Len = this.bkmvdata_parsed['b100'].length;
        let len = Math.max(c100Len, d110Len, d120Len, b100Len);

        for(let i=0;i<len;i++){
            if(i<c100Len){

                //Validate C100 headers has D110 or D120 lines
                let current = this.bkmvdata_parsed['c100'][i];
                if(this.validateHeader('c100', i))    
                    headerError.push([current['id'], current['fileno'], 'Error:: Missing Lines']); 

                //Validate C100 header amount is not negative
                if(this.validateNegativeHeaders(current))   
                    headerNegError.push([current['id'], current['fileno'], 'Error:: Negative Amount for Header'])  
                
                //Validate the summary of lines equals to header amount
                let lineSum = this.validateSummary(current);
                if(lineSum)
                    summaryError.push([current['id'], current['fileno'], lineSum]);
                
                //Validate amount + VAT equals to gross amount
                let lineVAT = this.validateVAT(current);
                if(lineVAT)
                vatError.push([current['id'], current['fileno'], lineVAT])
            }
            if(i<d110Len){
            //Validate D110 lines has C100 headers
                let current = this.bkmvdata_parsed['d110'][i];
                let lineDis = this.validateLineDicrepancy(current);
                if(this.validateHeader('d110', i))    
                    headerError.push([current['id'], current['fileno'], 'Error:: Missing Header']); 
                if(lineDis)
                    LineError.push([current['id'], current['fileno'], lineDis])
            }
            if(i<d120Len){
                //Validate D120 lines has C100 headers
                let current = this.bkmvdata_parsed['d120'][i];
                if(this.validateHeader('d120', i))    
                    headerError.push([current['id'], current['fileno'], 'Error:: Missing Header']);
            } 
            if(i<b100Len){
                let current = this.bkmvdata_parsed['b100'][i];
                if(this.validateJournals(current))    
                    JournalError.push([current['id'], current['fileno'], 'Error:: Missing Transaction Number']);
            }
        }

        //this.headerError = Array.from(header);
        this.headerError = headerError;
        this.headerNegError = headerNegError;
        this.LineError = LineError;
        this.JournalError = JournalError;
        this.summaryError = summaryError;
        this.vatError = vatError;
        //console.log(this.headerError)
        //console.log('search', this.tran_dict['c100']['23029'])
    },
    validateHeader(record, i){
        if(record=='c100'){
            if(!this.tran_dict['d110'][this.bkmvdata_parsed['c100'][i]['id']] && !this.tran_dict['d120'][this.bkmvdata_parsed['c100'][i]['id']]){
                return true;
            }
        }else{
            if(!this.tran_dict['c100'][this.bkmvdata_parsed[record][i]['id']]){
                return true;    
            } 
        }
        return false;              
    },
    validateSummary(header){
        //Validate that each C100 header's amount equals to it's D110 or D120 lines

        let lineSum = 0;
        let lines = this.tran_dict['d110'][header['id']];
        if(lines){
            for(let j=0;j<lines.length;j++){
                lineSum += lines[j]['amount'];
            }
        } 
        if(header['totalafterdiscount']!=lineSum && lineSum>0) return `Error:: Lines sum: ${lineSum} does not equal to header sum ${header['totalafterdiscount']}`;
        return false;
    },
    validateJournals(line){
        //return parseInt(this.bkmvdata_parsed['b100'][i]['trannumber'])==0;
        return parseInt(line['trannumber'])==0;
    },
    validateLineDicrepancy(line){
        let rate = parseInt(line['rate'])/100;
        let quantity = parseInt(line['quantity'])/10000;
        let amount = parseInt(line['amount'])/100;
        if(rate * quantity != amount)  return `Error:: ${rate} * ${quantity} does not equal to ${amount}`;
        return false;
    },
    validateVAT(header){
        let vat = header['vattotal'];
        let total = header['totalafterdiscount'];
        let grossAmt = header['grossamt'];
        if(Math.abs(total + vat - grossAmt)>1)  return `Error:: ${total} + ${vat} does not equal to ${grossAmt}`;
        return false;
    },
    validateNegativeHeaders(line){
        if(parseInt(line['totalafterdiscount'])<0)  return true;
        return false;
    }
};

/*(function testReport(){

    var ini_input='';
    var bkmvdata_input = '';
    async function loadData(callback){
        fs.readFile('public/ini.txt','utf8',(err, data)=>{
            if(err) throw err;
            ini_input = data;
        });
        fs.readFile('public/BKMVDATA.txt','utf8',(err, data)=>{
            if(err) throw err;
            bkmvdata_input = data;
        });
        setTimeout(()=>{
            callback(logData);
        }, 1000);
    }

    async function runReport(callback){
        reportHandler.ini = ini_input;
        reportHandler.bkmvdata = bkmvdata_input;
        reportHandler.init();
        callback();
    }

    function amountReducer(a, b){
        if(typeof(a) === 'object')    return parseInt(a['amount'] + b['amount']);
        else      return parseInt(a + b['amount']);
    }

    function logData(){
        //console.log(reportHandler.ini_parsed);
        //console.log(reportHandler.bkmvdata_parsed['d110']);
        console.log(reportHandler.tran_dict['d110']['23033'].reduce(amountReducer));(a, b)=>{
            //console.log(a);
            if(typeof(a) === 'object')    return parseInt(a['amount'] + b['amount']);
            else                          return parseInt(a + b['amount']);
            
        }));
        //console.log(reportHandler.tran_dict['d110']['23033']);
    }
    loadData(runReport)
})();*/

//Commented for tests
module.exports = reportHandler;
//exports.reportHandler = reportHandler;
//exports.validateJournals = reportHandler.validateJournals;



