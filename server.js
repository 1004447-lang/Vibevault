
const express=require("express")
const bodyParser=require("body-parser")
const fs=require("fs")
const nodemailer=require("nodemailer")
const multer=require("multer")
const cors=require("cors")

const app=express()
const PORT=process.env.PORT||3000

app.use(cors())
app.use(bodyParser.json())
app.use(express.static("public"))

const upload=multer({dest:"public/images/"})

let products=JSON.parse(fs.readFileSync("products.json"))
let orders=JSON.parse(fs.readFileSync("orders.json"))

let visits=0
let revenue=0

app.get("/api/visit",(req,res)=>{
visits++
res.json({visits})
})

app.get("/api/products",(req,res)=>{
res.json(products)
})

app.post("/api/products",upload.single("image"),(req,res)=>{

const {name,price,category}=req.body

const product={
id:Date.now(),
name,
price,
category,
image:"/images/"+req.file.filename
}

products.push(product)

fs.writeFileSync("products.json",JSON.stringify(products,null,2))

res.json(product)

})

app.post("/api/login",(req,res)=>{

const {email,password}=req.body

if(email==="tohmem7@gmail.com" && password==="mo7"){
res.json({admin:true})
}else{
res.json({admin:false})
}

})

app.get("/api/orders",(req,res)=>{
res.json(orders)
})

app.post("/api/order",(req,res)=>{

const order=req.body

orders.push(order)

revenue+=Number(order.total)

fs.writeFileSync("orders.json",JSON.stringify(orders,null,2))

sendReceipt(order)

res.json({success:true})

})

app.post("/api/tracking",(req,res)=>{

const {id,tracking}=req.body

let order=orders.find(o=>o.id==id)

if(order){

order.tracking=tracking
order.status="Check your email for tracking"

sendTracking(order)

}

fs.writeFileSync("orders.json",JSON.stringify(orders,null,2))

res.json({success:true})

})

app.get("/api/stats",(req,res)=>{

res.json({
revenue,
orders:orders.length,
products:products.length,
visits
})

})

const transporter=nodemailer.createTransport({
service:"gmail",
auth:{
user:process.env.EMAIL_USER,
pass:process.env.EMAIL_PASS
}
})

function sendReceipt(order){

let items=""

order.items.forEach(i=>{
items+=`${i.name} - $${i.price}\n`
})

transporter.sendMail({
from:"VELYRA",
to:order.email,
subject:"VELYRA Order Receipt",
html:`
<div style="font-family:sans-serif">
<img src="cid:logo" width="120"/>
<h2>Thank you for your order</h2>
<p>Name: ${order.name}</p>
<p>Items:</p>
<pre>${items}</pre>
<h3>Total: $${order.total}</h3>
</div>
`,
attachments:[{
filename:"logo.png",
path:"public/images/logo.png",
cid:"logo"
}]
})

}

function sendTracking(order){

transporter.sendMail({
from:"VELYRA",
to:order.email,
subject:"Your VELYRA Order Has Shipped",
html:`
<div style="font-family:sans-serif">
<img src="cid:logo" width="120"/>
<h2>Your order has shipped</h2>
<p>Tracking link:</p>
<a href="${order.tracking}">${order.tracking}</a>
</div>
`,
attachments:[{
filename:"logo.png",
path:"public/images/logo.png",
cid:"logo"
}]
})

}

app.listen(PORT,()=>console.log("Server running on "+PORT))
