

var fields={
    A000: ['code','space','totalRecords','empNumber','indentifier','systemConst','softwareId','softwareName','softwareVersion','softwareOwnerId',
    'softwareOwnerName','softwareType','fileSaveDirectory','softwareBookkeeping','requiredAccounting','companyNumber','companyWhNumber',
    'space_1','companyName','address','addressNum','addressCity','zip','taxYear','startDate','endDate','dateGenerated','hourGenerated',
    'Language','encoding','compressSoftware','currency','branches','space_2'],
    A100: ['code','fileno','empno','primaryIdentifier','SystemConst','space'],
    Z900: ['code','fileno','empno','primaryIdentifier','SystemConst','totalRecords','space'],
    D120: ['code','fileno','empno','doctype','docnum','doclinenum','paymentmethod','banknumber',
    'branchnumber','acctnumber','checknumber','paydate','amount','clearingcompany','creditcard','credittype','branchid','docdate','id','space'],
    M100: ['code','fileno','empno','itemSerial','itemVendorSerial','internalSerial','itemName','sortCode','sortCodeDescription','unitType',
    'itemOpenBalance','totalDebit','totalCredit','endCost','endCostA','space'],
    B100: ['code','fileno','empno','trannumber','linenumber','space_1','trantype','referencenumber','rectyoe','reference_2',
    'rectype_2','details','date','duedate','account','contraaccount','trandirection','currency','tranamount','tranfxamount',
    'quantity','space_2','space_3','space_4','datecreated','createdby','space_5'],
    B110: ['code','fileno','empno','acctnumber','acctname','bscode','bsdescription','clientstreet','clientno','clientcity',
    'clientzip','clientcountry','countrycode','summaryacct','openbalance','debit','credit','accountingcode','entitytaxid','branchid',
    'fxopenbalance','currency','space'],
    D110: ['code','fileno','empno','doctype','docnum','doclinenum','docmaintype','docmainnum','trantype','itemid','itemdescription','manufacturer',
    'serialnumber','unittype','quantity','rate','discount','amount','vat','branch','duedate','id','branchid','space'],
    C100: ['code','fileno','empno','doctype','docnum','docdate','dochour','customer','addrstreet','addrnumber','addrcity','addrzip',
    'addrcountry','addrcountrycode','phone','taxnumber','duedate','docfxtotal','currency','totalbeforediscount','discount',
    'totalafterdiscount','vattotal','grossamt','entityid','spaces_1','spaces_2','docdate_1','branch','user','id','spaces_3']
};

var positions={
    A000: [0,4,9,24,34,48,56,64,84,104,113,133,134,184,185,186,195,204,214,264,314,324,354,362,366,374,382,390,394,395,396,416,419,420],
    A100: [0,4,13,22,37,45],
    Z900: [0,4,13,22,37,45,60],
    D120: [0,4,13,22,25,45,49,50,60,70,85,95,103,118,119,139,140,147,155,162],
    M100: [0,4,13,22,42,62,82,132,142,172,192,204,216,228,238,248],
    B100: [0,4,13,22,32,37,45,60,80,83,103,106,156,164,172,187,202,203,206,221,236,248,258,268,275,283,292],
    B110: [0,4,13,22,37,87,102,132,182,192,222,230,260,262,277,292,307,322,326,335,342,357,360],
    D110: [0,4,13,22,25,45,49,52,72,73,93,123,173,203,223,240,255,270,285,289,296,304,311,318],
    C100: [0,4,13,22,25,45,53,57,107,157,167,197,205,235,237,252,261,269,284,287,302,317,332,347,374,389,399,400,408,415,424,431],
};

var recordTitles ={
    100: 'salesorder',
    305: 'invoice',
    320: 'cashsale',
    330: 'creditmemo/cashrefund',
    400: 'customerdeposit/customerpayment',
    410: 'customerrefund/vendorpayment/cashrefund_2',
    500: 'purchaseorder',
    700: 'vendorbill',
    710: 'vendorcredit',
    810: 'itemreceipt',
    820: 'itemfulfillment',
    830: 'inventorytransfer/transferorder',
    840: 'inventoryadjustment',
    900: 'assemblybuild',
    910: 'assemblyunbuild',
};



//module.exports = [fields, positions];
exports.fields = fields;
exports.positions = positions;
exports.recordTitles = recordTitles;
