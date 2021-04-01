var reportHandler = {
    inputs:{
        bkmvdata: null,
        ini: null,
    },
    init(){

    },
    processIni(input_data){
        var input=input_data.split('\n');  
        var records={a000:[],b100:0,b110:0,c100:0,d110:0,d120:0,m100:0,};

        for(let i=0;i<input.length;i++){
            let line=input[i].substring(0,4);
            switch(line){
                case 'A000':    records['a000']=processRecord(input[i]);              break;
                case 'B100':    records['b100']=parseInt(input[i].substr(4,15));      break;
                case 'B110':    records['b110']=parseInt(input[i].substr(4,15));      break;
                case 'C100':    records['c100']=parseInt(input[i].substr(4,15));      break;
                case 'D110':    records['d110']=parseInt(input[i].substr(4,15));      break;
                case 'D120':    records['d120']=parseInt(input[i].substr(4,15));      break;
                case 'M100':    records['m100']=parseInt(input[i].substr(4,15));      break;
            }
        }
        this.ini = records;
    },
    processBkmvdata(){

    }
};

/*
var ini = `A000     000000000000380514783794020200220143300&OF1.31&00217901 NetSuite i Cloudius                 1.1514783794i Cloudius          2                    OPENFRMT/514783794.20/0220143321514783794923667943                                               iCloudius LTD                                         Ha-Shfela         3                 Tel Aviv-Yafo501482350000202001012020013120200220043321            NetsuiteILS0                                              
            B100000000000000134
            B110000000000000121
            C100000000000000047
            D110000000000000054
            D120000000000000013
            M100000000000000009
            `
reportHandler.processIni(ini);
*/