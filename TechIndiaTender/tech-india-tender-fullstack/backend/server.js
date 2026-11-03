require('dotenv').config();
const path=require('path');
const express=require('express');
const cors=require('cors');
const helmet=require('helmet');
const morgan=require('morgan');
const compression=require('compression');
const rateLimit=require('express-rate-limit');

const authRoutes=require('./routes/authRoutes');
const tenderRoutes=require('./routes/tenderRoutes');
const adminRoutes=require('./routes/adminRoutes');
const notificationRoutes=require('./routes/notificationRoutes');
const paymentRoutes=require('./routes/paymentRoutes');

const app=express();
app.set('trust proxy',1);
app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}));
app.use(cors({origin:process.env.FRONTEND_URL||'*',credentials:true}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({limit:'2mb'}));
app.use(express.urlencoded({extended:true}));

app.use('/api/auth',rateLimit({windowMs:15*60*1000,max:100}));
app.use('/api',rateLimit({windowMs:15*60*1000,max:500}));

app.use('/api/auth',authRoutes);
app.use('/api/tenders',tenderRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/notifications',notificationRoutes);
app.use('/api/payments',paymentRoutes);

app.use(express.static(path.join(__dirname,'..','public')));
app.get(/^\/(?!api).*/,(req,res)=>res.sendFile(path.join(__dirname,'..','public','index.html')));

app.use((req,res)=>res.status(404).json({success:false,message:'Route not found'}));
app.use((err,req,res,next)=>{
 console.error(err);
 res.status(err.status||500).json({success:false,message:err.message||'Internal server error'});
});

const PORT=process.env.PORT||5000;
app.listen(PORT,()=>console.log(`Tech India Tender server running on http://localhost:${PORT}`));
