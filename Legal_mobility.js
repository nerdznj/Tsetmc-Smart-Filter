// =======================================================
//  FİLTER هوشمند + پیش‌بینی روند صعودی سهام
//  نسخه: 1.0
//  نویسنده: Amin Taghibeyglou
//  توضیح: این فیلتر با استفاده از حجم معاملات، کف و سقف، 
//         قدرت خریدار/فروشنده، Momentum، شیب رگرسیون و 
//         Volatility Breakout سهم‌هایی با احتمال رشد را شناسایی می‌کند.
// =======================================================

// 1️⃣ میانگین حجم معاملات 21 روزه
let sum=0, count=0;
for(let n=0;n<21;n++){
    if(typeof [ih][n]!="undefined"){
        sum += [ih][n].QTotTran5J;
        count++;
    }
}
let m = (count>0 ? sum/count : 0);

// 2️⃣ کف و سقف 60 روزه
let min=1e9, max=0;
for(let n=0;n<60;n++){
    if(typeof [ih][n]!="undefined"){
        if([ih][n].PriceMin!=0 && [ih][n].PriceMin<min) min=[ih][n].PriceMin;
        if([ih][n].PriceMax!=0 && [ih][n].PriceMax>max) max=[ih][n].PriceMax;
    }
}

// 3️⃣ قدرت خریدار و فروشنده حقوقی
let x = ((ct).Buy_CountI>0 ? Math.round(((ct).Buy_I_Volume/(ct).Buy_CountI)*(pc)/1e7) : 0);
let y = ((ct).Sell_CountI>0 ? Math.round(((ct).Sell_I_Volume/(ct).Sell_CountI)*(pc)/1e7) : 0);

// 4️⃣ نسبت میانگین ماهانه
let z = Math.round(m/1000)/1000;

// 5️⃣ فاصله از کف و سقف
let Min1 = (min>0 ? Math.round(1000*((pl)/min-1))/10 : 0);
let Max1 = ((pl)>0 ? Math.round(1000*(max/((pl))-1))/10 : 0);

// 6️⃣ شاخص Momentum (قدرت روند کوتاه‌مدت)
let momentum = ((pl) - ([ih][20]? [ih][20].PClosing:(pl)))/(m || 1);

// 7️⃣ رگرسیون خطی ساده با 5 روز اخیر
let slope=0, validCount=0, sumX=0, sumY=0, sumXY=0, sumX2=0;
for(let i=0;i<5;i++){
    if(typeof [ih][i]!="undefined"){
        let xi=i, yi=[ih][i].PClosing;
        sumX+=xi; sumY+=yi; sumXY+=xi*yi; sumX2+=xi*xi; validCount++;
    }
}
slope = (validCount>1 ? (validCount*sumXY - sumX*sumY)/(validCount*sumX2 - sumX*sumX) : 0);

// 8️⃣ Volatility Breakout
let volSum=0, volCount=0;
for(let i=0;i<10;i++){
    if(typeof [ih][i]!="undefined"){ volSum += Math.pow((pl)-[ih][i].PClosing,2); volCount++; }
}
let volatility = volCount>0 ? Math.sqrt(volSum/volCount) : 0;
let breakout = ((pl) - ([ih][1]? [ih][1].PClosing:(pl))) > 1.5*volatility;

// 9️⃣ سیستم امتیازدهی Composite Score
let Score=0;
if((tvol)>2*m) Score+=2; else if((tvol)>1.5*m) Score+=1;
if(x>y) Score+=2; 
if(Min1<10) Score+=1; // نزدیک کف حمایتی
if(momentum>0) Score+=2;
if(slope>0) Score+=1;
if(breakout) Score+=2;

// 10️⃣ نمایش سهم‌های با امتیاز کافی و بصری
if(Score>=6){
    let green="🟢", yellow="🟡", red="🔴";

    let volumeIcon = ((tvol)>2*m ? green : ((tvol)>1.5*m ? yellow : red));
    let liquidityIcon = (m>0.0005*(z) ? green : (m>0.0003*(z) ? yellow : red));
    let minIcon = (Min1<5 ? green : (Min1<10 ? yellow : red));
    let maxIcon = (Max1>50 ? green : (Max1>30 ? yellow : red));
    let momentumIcon = (momentum>0 ? green : red);
    let slopeIcon = (slope>0 ? green : red);
    let breakoutIcon = (breakout ? green : red);

    (cfield0) = (l18); // نماد
    (cfield1) = "Score: "+Score+" "+green.repeat(Score);
    (cfield2) = "کف:"+Min1+"% "+minIcon+" | سقف:"+Max1+"% "+maxIcon;
    (cfield3) = "💰 خریدار:"+x+" | فروشنده:"+y+" "+volumeIcon+liquidityIcon;
    (cfield4) = "📈 Momentum:"+momentumIcon+" Slope:"+slopeIcon+" Breakout:"+breakoutIcon;

    true; 
}else{
    false; 
}

// 🕵️‍♂️ Secret description
let secretDescription = "2YXYs9mK2YbYsdmK2YUg2KfZhNmB2KfZhNiv2Kkg2YjYp9mE2YXYp9mE2YbYqtmI2YrYp9mE2KfYtNmE2KfZhNip2KfZhNiv2KfYqNmG2Kkg2KfZhNin2YXYqiDYp9mE2YjZhtmK2KfYqNmG2Kkg2KfZhNin2YXYqiDaqtix2KfYsdin2KfYqNmG2Kkg2YXYs9mK2YbYsdmK2YUg2KfZhNmB2KfZhNiv2Ykg2KfZhNin2YXYqg==";

