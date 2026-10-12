import React,{useEffect,useMemo,useState}from'react';
import{
  Download,
  FileText,
  Printer,
  CalendarDays,
  History,
  Eye,
  Trash2
}from'lucide-react';

import{
  Header,
  Panel,
  Button
}from'../../components/UI/UI';

import{
  getInventory,
  getPurchases,
  getUsage,
  getWastage,
  money,
  todayKey,
  startOfWeek,
  startOfMonth,
  inRange
}from'../../utils/store';

import jsPDF from'jspdf';

import'./Reports.css';


const REPORT_KEY='hotelstock_report_history';


export default function Reports(){

  const[data,setData]=useState({
    i:[],
    p:[],
    u:[],
    w:[]
  });

  const[period,setPeriod]=useState('today');

  const[history,setHistory]=useState([]);

  const[preview,setPreview]=useState(null);


  const load=()=>{

    setData({
      i:getInventory(),
      p:getPurchases(),
      u:getUsage(),
      w:getWastage()
    });

    try{

      const saved=
        JSON.parse(
          localStorage.getItem(REPORT_KEY)||'[]'
        );

      setHistory(saved);

    }catch{

      setHistory([]);

    }

  };


  useEffect(()=>{

    load();

    window.addEventListener(
      'hotel_data_updated',
      load
    );

    return()=>{

      window.removeEventListener(
        'hotel_data_updated',
        load
      );

    };

  },[]);


  const today=todayKey();

  const start=
    period==='today'
      ?today
      :period==='week'
        ?startOfWeek(today)
        :startOfMonth(today);


  const title=
    period==='today'
      ?'Daily'
      :period==='week'
        ?'Weekly'
        :'Monthly';


  const p=data.p.filter(
    x=>inRange(x.date,start,today)
  );

  const u=data.u.filter(
    x=>inRange(x.date,start,today)
  );

  const w=data.w.filter(
    x=>inRange(x.date,start,today)
  );


  const pv=p.reduce(
    (a,x)=>a+Number(x.total||0),
    0
  );

  const uv=u.reduce(
    (a,x)=>a+Number(x.value||0),
    0
  );

  const wv=w.reduce(
    (a,x)=>a+Number(x.value||0),
    0
  );

  const sv=data.i.reduce(
    (a,x)=>
      a+
      Number(x.current||0)*
      Number(x.price||0),
    0
  );


  const entries=useMemo(()=>{

    return[
      ...p.map(x=>({
        ...x,
        type:'Purchase',
        value:Number(x.total||0)
      })),

      ...u.map(x=>({
        ...x,
        type:'Usage',
        value:Number(x.value||0)
      })),

      ...w.map(x=>({
        ...x,
        type:'Wastage',
        value:Number(x.value||0)
      }))

    ].sort(
      (a,b)=>
        b.date.localeCompare(a.date)
    );

  },[p,u,w]);


  /* =========================================
     SAVE REPORT HISTORY
  ========================================= */

  const saveHistory=report=>{

    const current=
      JSON.parse(
        localStorage.getItem(REPORT_KEY)||'[]'
      );

    const next=[
      report,
      ...current
    ];

    localStorage.setItem(
      REPORT_KEY,
      JSON.stringify(next.slice(0,50))
    );

    setHistory(next.slice(0,50));

  };


  /* =========================================
     CREATE PDF
  ========================================= */

  const createPDF=(reportData,download=true)=>{

    const doc=new jsPDF();

    const{
      reportTitle,
      reportDate,
      purchases,
      usage,
      wastage,
      purchaseValue,
      usageValue,
      wastageValue,
      stockValue,
      entries:reportEntries
    }=reportData;


    /* HEADER */

    doc.setFontSize(22);

    doc.setFont('helvetica','bold');

    doc.text(
      'HotelStock',
      20,
      22
    );


    doc.setFontSize(10);

    doc.setFont('helvetica','normal');

    doc.text(
      'Inventory & Management Report',
      20,
      29
    );


    doc.setFontSize(16);

    doc.setFont('helvetica','bold');

    doc.text(
      `${reportTitle} Report`,
      20,
      43
    );


    doc.setFontSize(10);

    doc.setFont('helvetica','normal');

    doc.text(
      `Report Period: ${reportDate}`,
      20,
      51
    );


    /* SUMMARY */

    let y=65;

    doc.setFontSize(12);

    doc.setFont('helvetica','bold');

    doc.text(
      'Summary',
      20,
      y
    );


    y+=10;

    doc.setFontSize(10);

    doc.setFont('helvetica','normal');

    doc.text(
      `Purchase: ${money(purchaseValue)}`,
      25,
      y
    );

    y+=7;

    doc.text(
      `Usage: ${money(usageValue)}`,
      25,
      y
    );

    y+=7;

    doc.text(
      `Wastage: ${money(wastageValue)}`,
      25,
      y
    );

    y+=7;

    doc.text(
      `Current Stock Value: ${money(stockValue)}`,
      25,
      y
    );

    y+=12;


    /* COUNTS */

    doc.setFont('helvetica','bold');

    doc.text(
      'Entry Count',
      20,
      y
    );

    y+=8;

    doc.setFont('helvetica','normal');

    doc.text(
      `Purchases: ${purchases}`,
      25,
      y
    );

    y+=7;

    doc.text(
      `Usage: ${usage}`,
      25,
      y
    );

    y+=7;

    doc.text(
      `Wastage: ${wastage}`,
      25,
      y
    );

    y+=14;


    /* TABLE HEADER */

    doc.setFont('helvetica','bold');

    doc.text(
      'Date',
      20,
      y
    );

    doc.text(
      'Type',
      50,
      y
    );

    doc.text(
      'Product',
      82,
      y
    );

    doc.text(
      'Qty',
      140,
      y
    );

    doc.text(
      'Value',
      170,
      y
    );

    y+=6;

    doc.setFont('helvetica','normal');


    reportEntries.forEach(item=>{

      if(y>275){

        doc.addPage();

        y=20;

      }


      const product=
        String(item.product||'-')
        .substring(0,25);

      const qty=
        `${item.qty||0} ${item.unit||''}`;

      doc.text(
        String(item.date||'-'),
        20,
        y
      );

      doc.text(
        String(item.type||'-'),
        50,
        y
      );

      doc.text(
        product,
        82,
        y
      );

      doc.text(
        qty.substring(0,15),
        140,
        y
      );

      doc.text(
        money(item.value||0),
        170,
        y
      );

      y+=7;

    });


    /* FOOTER */

    const pages=
      doc.internal.getNumberOfPages();

    for(let i=1;i<=pages;i++){

      doc.setPage(i);

      doc.setFontSize(8);

      doc.setTextColor(120);

      doc.text(
        `HotelStock • ${reportTitle} Report • Page ${i} of ${pages}`,
        20,
        290
      );

      doc.setTextColor(0);

    }


    const filename=
      `hotelstock-${reportTitle.toLowerCase()}-${reportDate.replace(/\//g,'-')}.pdf`;


    if(download){

      doc.save(filename);

    }


    return doc;

  };


  /* =========================================
     GENERATE CURRENT REPORT
  ========================================= */

  const generateReport=()=>{

    const reportDate=
      period==='today'
        ?today
        :`${start} to ${today}`;


    const report={

      id:
        `report-${Date.now()}`,

      type:title,

      reportTitle:title,

      reportDate,

      createdAt:
        new Date().toISOString(),

      purchases:p.length,

      usage:u.length,

      wastage:w.length,

      purchaseValue:pv,

      usageValue:uv,

      wastageValue:wv,

      stockValue:sv,

      entries

    };


    saveHistory(report);

    createPDF(report,true);

  };


  /* =========================================
     DOWNLOAD PREVIOUS REPORT
  ========================================= */

  const downloadPrevious=report=>{

    createPDF(
      report,
      true
    );

  };


  /* =========================================
     VIEW PREVIOUS REPORT
  ========================================= */

  const viewPrevious=report=>{

    setPreview(report);

  };


  /* =========================================
     DELETE HISTORY
  ========================================= */

  const deleteReport=id=>{

    if(
      !window.confirm(
        'Delete this saved report?'
      )
    )return;


    const next=
      history.filter(
        x=>x.id!==id
      );


    localStorage.setItem(
      REPORT_KEY,
      JSON.stringify(next)
    );

    setHistory(next);

  };


  return(

    <div className="page reportsPage">

      <Header
        eyebrow="Analytics"
        title="Reports"
        subtitle="Generate daily, weekly and monthly PDF reports and download previous reports anytime."
        action={
          <Button
            onClick={generateReport}
          >
            <FileText size={14}/>
            Generate {title} PDF
          </Button>
        }
      />


      {/* PERIOD SELECTOR */}

      <div className="reportTools">

        <div className="reportPeriods">

          {[
            ['today','Today'],
            ['week','Weekly'],
            ['month','Monthly']
          ].map(x=>

            <button
              key={x[0]}
              className={
                period===x[0]
                  ?'active'
                  :''
              }
              onClick={()=>
                setPeriod(x[0])
              }
            >

              <CalendarDays size={13}/>

              {x[1]}

            </button>

          )}

        </div>


        <button
          className="printReport"
          onClick={()=>window.print()}
        >
          <Printer size={13}/>
          Print
        </button>

      </div>


      {/* SUMMARY */}

      <div className="reportStats">

        <div className="reportStat">

          <span>{title} Purchase</span>

          <b>{money(pv)}</b>

          <small>
            {p.length} purchase entries
          </small>

        </div>


        <div className="reportStat green">

          <span>{title} Usage</span>

          <b>{money(uv)}</b>

          <small>
            {u.length} usage entries
          </small>

        </div>


        <div className="reportStat orange">

          <span>{title} Wastage</span>

          <b>{money(wv)}</b>

          <small>
            {w.length} wastage entries
          </small>

        </div>


        <div className="reportStat blue">

          <span>Current Stock Value</span>

          <b>{money(sv)}</b>

          <small>
            Current inventory
          </small>

        </div>

      </div>


      {/* CURRENT REPORT */}

      <Panel
        title={`${title} report entries`}
        action={
          <Button
            kind="light"
            onClick={generateReport}
          >
            <Download size={14}/>
            Save PDF
          </Button>
        }
      >

        <div className="tableWrap">

          <table className="table">

            <thead>

              <tr>

                <th>Date</th>
                <th>Type</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Value</th>

              </tr>

            </thead>


            <tbody>

              {entries.length?

                entries.map((x,i)=>

                  <tr key={i}>

                    <td>
                      {x.date}
                    </td>


                    <td>

                      <span
                        className={
                          'badge '+
                          (
                            x.type==='Purchase'
                              ?'greenB'
                              :x.type==='Usage'
                                ?'blueB'
                                :'redB'
                          )
                        }
                      >
                        {x.type}
                      </span>

                    </td>


                    <td className="item">
                      {x.product}
                    </td>


                    <td>
                      {x.qty} {x.unit}
                    </td>


                    <td>
                      {money(x.value)}
                    </td>

                  </tr>

                )

                :

                <tr>

                  <td
                    colSpan="5"
                    className="empty"
                  >
                    No data for this period.
                  </td>

                </tr>

              }

            </tbody>

          </table>

        </div>

      </Panel>


      {/* PREVIOUS REPORTS */}

      <Panel
        title="Previous Reports"
        action={
          <span className="historyCount">
            {history.length} saved
          </span>
        }
      >

        <div className="previousReports">

          {history.length?

            history.map(report=>

              <div
                className="previousReport"
                key={report.id}
              >

                <div className="previousIcon">
                  <FileText size={19}/>
                </div>


                <div className="previousInfo">

                  <strong>
                    {report.type} Report
                  </strong>

                  <span>
                    {report.reportDate}
                  </span>

                  <small>
                    Created {
                      new Date(
                        report.createdAt
                      ).toLocaleString('en-IN')
                    }
                  </small>

                </div>


                <div className="previousSummary">

                  <span>
                    Purchase
                    <b>
                      {money(report.purchaseValue)}
                    </b>
                  </span>

                  <span>
                    Usage
                    <b>
                      {money(report.usageValue)}
                    </b>
                  </span>

                  <span>
                    Wastage
                    <b>
                      {money(report.wastageValue)}
                    </b>
                  </span>

                </div>


                <div className="previousActions">

                  <button
                    title="View"
                    onClick={()=>
                      viewPrevious(report)
                    }
                  >
                    <Eye size={15}/>
                  </button>


                  <button
                    title="Download PDF"
                    onClick={()=>
                      downloadPrevious(report)
                    }
                  >
                    <Download size={15}/>
                  </button>


                  <button
                    title="Delete"
                    className="danger"
                    onClick={()=>
                      deleteReport(report.id)
                    }
                  >
                    <Trash2 size={15}/>
                  </button>

                </div>

              </div>

            )

            :

            <div className="noReports">

              <History size={30}/>

              <strong>
                No previous reports
              </strong>

              <span>
                Generate your first Daily, Weekly or Monthly PDF report.
              </span>

            </div>

          }

        </div>

      </Panel>


      {/* PREVIEW MODAL */}

      {preview&&(

        <div
          className="reportPreviewOverlay"
          onClick={()=>
            setPreview(null)
          }
        >

          <div
            className="reportPreview"
            onClick={e=>
              e.stopPropagation()
            }
          >

            <div className="previewHead">

              <div>

                <small>
                  SAVED REPORT
                </small>

                <h2>
                  {preview.type} Report
                </h2>

                <p>
                  {preview.reportDate}
                </p>

              </div>


              <button
                onClick={()=>
                  setPreview(null)
                }
              >
                ×
              </button>

            </div>


            <div className="previewStats">

              <div>
                <span>Purchase</span>
                <b>
                  {money(preview.purchaseValue)}
                </b>
              </div>

              <div>
                <span>Usage</span>
                <b>
                  {money(preview.usageValue)}
                </b>
              </div>

              <div>
                <span>Wastage</span>
                <b>
                  {money(preview.wastageValue)}
                </b>
              </div>

              <div>
                <span>Stock</span>
                <b>
                  {money(preview.stockValue)}
                </b>
              </div>

            </div>


            <div className="previewTable">

              <table className="table">

                <thead>

                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Value</th>
                  </tr>

                </thead>

                <tbody>

                  {preview.entries.map(
                    (x,i)=>

                      <tr key={i}>

                        <td>{x.date}</td>

                        <td>{x.type}</td>

                        <td>{x.product}</td>

                        <td>
                          {x.qty} {x.unit}
                        </td>

                        <td>
                          {money(x.value)}
                        </td>

                      </tr>

                  )}

                </tbody>

              </table>

            </div>


            <div className="previewActions">

              <button
                className="closePreview"
                onClick={()=>
                  setPreview(null)
                }
              >
                Close
              </button>


              <button
                className="downloadPreview"
                onClick={()=>
                  downloadPrevious(preview)
                }
              >
                <Download size={14}/>
                Download PDF
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}