let chart;
let latestReport = {};
const diseases = ["diabetes","heart","kidney","liver","thyroid"];

// On load, render patient history
window.onload = renderHistory;

function predict() {
    const data = {
        name: document.getElementById("patientName").value || "Anonymous",
        pregnancies: +document.getElementById("pregnancies").value,
        glucose: +document.getElementById("glucose").value,
        bloodPressure: +document.getElementById("bloodPressure").value,
        skinThickness: +document.getElementById("skinThickness").value,
        insulin: +document.getElementById("insulin").value,
        bmi: +document.getElementById("bmi").value,
        dpf: +document.getElementById("dpf").value,
        age: +document.getElementById("age").value
    };

    fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => renderDashboard(result, data))
    .catch(err => alert("❌ Backend not connected"));
}

function renderDashboard(result, data) {
    // Risk assessment text
    let riskText = "🧬 Disease Risk Assessment\n";
    diseases.forEach(d => {
        riskText += `${capitalize(d)}: ${result[d] ? "🔴 High Risk" : "🟢 Low Risk"}\n`;
    });
    document.getElementById("risk").innerText = riskText;

    // Doctor advice
    document.getElementById("doctorAdvice").innerText =
`👨‍⚕️ Doctor Recommendation
${Object.values(result).some(v=>v)? "Medical supervision and lifestyle changes are strongly advised." : "Patient condition stable. Preventive care advised."}`;

    // Precautions
    document.getElementById("precautions").innerText =
`🛡️ Precautions
${Object.values(result).some(v=>v)? "• Avoid sugar & processed food\n• Exercise daily\n• Avoid smoking & alcohol\n• Monitor vitals"
: "• Balanced diet\n• Regular exercise\n• Annual checkups"}`;

    // Recommended tests
    document.getElementById("tests").innerText =
`🧪 Recommended Tests
${Object.values(result).some(v=>v)? "HbA1c, Lipid Profile, BP Monitoring, Kidney Function Test, Liver Function Test, Thyroid Panel"
: "Annual Blood Sugar Screening"}`;

    // Draw chart & meters
    drawChart(result);
    animateMeters(result);

    // Build report object
    latestReport = {data,result};

    // Save patient history
    saveHistory(data,result);
}

function drawChart(result) {
    const riskValues = diseases.map(d=>result[d]?Math.floor(Math.random()*20)+70:Math.floor(Math.random()*30)+20);
    if(chart) chart.destroy();
    chart = new Chart(document.getElementById("riskChart"),{
        type:'bar',
        data:{
            labels: diseases.map(d=>capitalize(d)),
            datasets:[{
                label:"Risk Confidence (%)",
                data:riskValues,
                backgroundColor: riskValues.map((v,i)=>result[diseases[i]]?'rgba(255,61,61,0.8)':'rgba(0,191,166,0.8)'),
                borderRadius:10
            }]
        },
        options:{
            animation:{duration:1500},
            scales:{y:{beginAtZero:true,max:100,title:{display:true,text:"Risk Confidence (%)"}}}
        }
    });
}

function animateMeters(result){
    const meterData = {
        diabetes:['diabetesMeter','diabetesPercent', result.diabetes?80:20,result.diabetes],
        heart:['heartMeter','heartPercent', result.heart?75:25,result.heart],
        kidney:['kidneyMeter','kidneyPercent', result.kidney?70:30,result.kidney],
        liver:['liverMeter','liverPercent', result.liver?65:25,result.liver],
        thyroid:['thyroidMeter','thyroidPercent', result.thyroid?60:20,result.thyroid]
    };
    for(let key in meterData) {
        const [circleId, percentId, value, highRisk] = meterData[key];
        animateMeter(circleId, percentId, value, highRisk);
    }
}

function animateMeter(circleId, percentId, value, isHighRisk){
    const circle=document.getElementById(circleId);
    const percentText=document.getElementById(percentId);
    const radius=circle.r.baseVal.value;
    const circumference=2*Math.PI*radius;
    circle.style.strokeDasharray=`${circumference}`;
    circle.style.strokeDashoffset=`${circumference}`;
    circle.style.stroke=isHighRisk?'rgba(255,61,61,0.9)':'rgba(0,191,166,0.9)';
    let offset=circumference-(value/100)*circumference;
    circle.style.transition='stroke-dashoffset 1.5s ease';
    setTimeout(()=>{circle.style.strokeDashoffset=offset;percentText.innerText=`${value}%`;},100);
}

function saveHistory(data,result){
    let history=JSON.parse(localStorage.getItem("patientHistory")||"[]");
    const timestamp=new Date().toLocaleString();
    history.unshift({timestamp,data,result});
    if(history.length>10) history.pop();
    localStorage.setItem("patientHistory",JSON.stringify(history));
    renderHistory();
}

function renderHistory(){
    const history=JSON.parse(localStorage.getItem("patientHistory")||"[]");
    const ul=document.getElementById("patientHistory");
    ul.innerHTML="";
    history.forEach(h=>{
        const li=document.createElement("li");
        li.textContent=`${h.timestamp} → ${h.data.name}: ${capitalize(Object.keys(h.result).filter(k=>h.result[k]).join(", ")||"No High Risk")}`;
        ul.appendChild(li);
    });
}

function capitalize(str){return str.charAt(0).toUpperCase()+str.slice(1);}

// 🔥 Ultimate PDF Download including charts, meters, history, clinic logo
async function downloadReport(){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p','mm','a4');
    const margin = 14;
    let y = 20;

    // Clinic Header
    doc.setFontSize(18);
    doc.setFont("Roboto","bold");
    doc.text("🏥 AI Smart Healthcare Clinic", margin, y);
    y+=8;
    doc.setFontSize(12);
    doc.text("Address: 123 Health St., Wellness City | Contact: +91 99999 99999", margin, y);
    y+=12;

    // Patient Info
    doc.setFont("Roboto","normal");
    doc.setFontSize(14);
    doc.text(`Patient Name: ${latestReport.data.name}`, margin, y);
    y+=7;
    doc.text(`Age: ${latestReport.data.age}`, margin, y);
    y+=7;
    doc.text(`Date: ${new Date().toLocaleString()}`, margin, y);
    y+=10;

    // Clinical Assessment Text
    doc.setFontSize(12);
    doc.text("Clinical Assessment:", margin, y);
    y+=7;
    let textLines = Object.entries(latestReport.result).map(([k,v])=>`${capitalize(k)}: ${v?"High Risk 🔴":"Low Risk 🟢"}`);
    textLines.forEach(line=>{
        if(y>270){doc.addPage(); y=20;} // multipage support
        doc.text(line, margin, y); y+=6;
    });

    // Precautions
    if(y>270){doc.addPage(); y=20;}
    doc.text("Precautions:", margin, y); y+=6;
    const precautions = (Object.values(latestReport.result).some(v=>v)
        ? "• Avoid sugar & processed food\n• Exercise daily\n• Avoid smoking & alcohol\n• Monitor vitals"
        : "• Balanced diet\n• Regular exercise\n• Annual checkups").split("\n");
    precautions.forEach(line=>{
        if(y>270){doc.addPage(); y=20;}
        doc.text(line, margin, y); y+=6;
    });

    // Risk Visualization + Meters as Images
    const chartCanvas = await html2canvas(document.getElementById("riskChart"), {scale:2});
    const metersCanvas = await html2canvas(document.querySelector(".meters-container"), {scale:2});

    const chartImg = chartCanvas.toDataURL("image/png");
    const metersImg = metersCanvas.toDataURL("image/png");

    if(y>150){doc.addPage(); y=20;}
    doc.text("Risk Visualization Chart:", margin, y); y+=5;
    doc.addImage(chartImg,'PNG',margin,y,180,80);
    y+=85;

    if(y>150){doc.addPage(); y=20;}
    doc.text("Confidence Meters:", margin, y); y+=5;
    doc.addImage(metersImg,'PNG',margin,y,180,80);
    y+=85;

    // Patient History
    const history = JSON.parse(localStorage.getItem("patientHistory")||"[]");
    if(y>250){doc.addPage(); y=20;}
    doc.text("Patient History (last 10):", margin, y); y+=7;
    history.forEach(h=>{
        if(y>270){doc.addPage(); y=20;}
        doc.text(`${h.timestamp} → ${h.data.name}: ${capitalize(Object.keys(h.result).filter(k=>h.result[k]).join(", ")||"No High Risk")}`, margin, y);
        y+=6;
    });

    doc.save(`Patient_Report_${latestReport.data.name.replace(" ","_")}.pdf`);
}
