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
    },
    rejects:{
        headerError: null,
        summaryError: null,
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
                    //accessories.recordTitles['A000']
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
        //Check headers vs. lines
        this.validateHeader();

        //Check header has same amount as lines
        //this.validateSummary()

    },
    validateHeader(){
        //validate that each C100 header has D110 or D120 line.

        var header = new Set();
        let len = Math.max(this.bkmvdata_parsed['c100'].length, this.bkmvdata_parsed['d110'].length, this.bkmvdata_parsed['d120'].length);

        for(let i=0;i<len;i++){
            //Validate C100 headers has D110 or D120 lines
            if(i<this.bkmvdata_parsed['c100'].length)   if(!this.tran_dict['d110'][this.bkmvdata_parsed['c100'][i]['id']] && !this.tran_dict['d120'][this.bkmvdata_parsed['c100'][i]['id']])  header.add(this.bkmvdata_parsed['c100'][i]['id']);
            //Validate D110 lines has C100 headers
            if(i<this.bkmvdata_parsed['d110'].length)   if(!this.tran_dict['c100'][this.bkmvdata_parsed['d110'][i]['id']])  header.add(this.bkmvdata_parsed['d110'][i]['id']);
            //Validate D120 lines has C100 headers
            if(i<this.bkmvdata_parsed['d120'].length)   if(!this.tran_dict['c100'][this.bkmvdata_parsed['d120'][i]['id']])  header.add(this.bkmvdata_parsed['d120'][i]['id']);
        }

        this.headerError = header;
        console.log(this.headerError)
        //console.log('search', this.tran_dict['c100']['23029'])
    },
    validateSummary(){
        //Validate that each C100 header's amount equals to it's D110 or D120 lines

        var summary = new Set();
        
        for(let i=0;i<this.bkmvdata_parsed['c100'].length;i++){
            let header = this.bkmvdata_parsed['c100'][i];
            let headerAmount = header['totalafterdiscount'];
            let hasLines = typeof(this.tran_dict['d110'][header['id']])!='undefined' //? this.tran_dict['d110'][this.bkmvdata_parsed['c100'][i]['id']].reduce(amountReducer) : 0;
            let lineLen = hasLines ? this.tran_dict['d110'][header['id']].length : 0;
            let lines = hasLines ? (lineLen>0 ? this.tran_dict['d110'][header['id']].reduce(amountReducer) : this.tran_dict['d110'][header['id']]['amount']) : 0;
            //console.log(headerAmount, hasLines, lines);
        }

        function amountReducer(a, b){
            if(typeof(a) === 'object')    return parseInt(a['amount'] + b['amount']);
            else      return parseInt(a + b['amount']);
        }
        
        this.summaryError = summary;
        //console.log(this.summaryError)
    },
    validateAccounts(){

    },
    validateLineDicrepancy(){

    },
    validateVAT(){

    },
    validateNegativeHeaders(){

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

module.exports = reportHandler;


