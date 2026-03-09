
fetch('/api/visit')

let cart=JSON.parse(localStorage.getItem("cart")||"[]")

async function loadProducts(){

const res=await fetch("/api/products")
const data=await res.json()

const container=document.getElementById("products")

if(!container)return

container.innerHTML=""

data.forEach(p=>{

container.innerHTML+=`
<div class="card">
<img src="${p.image}" width="100%">
<h3>${p.name}</h3>
<p>$${p.price}</p>
<button onclick='addToCart(${JSON.stringify(p)})'>Add to Cart</button>
</div>
`

})

}

function addToCart(p){

cart.push(p)

localStorage.setItem("cart",JSON.stringify(cart))

alert("Added to cart")

}

function loadCart(){

const list=document.getElementById("cart")

let total=0

cart.forEach(i=>{

total+=Number(i.price)

list.innerHTML+=`<div>${i.name} - $${i.price}</div>`

})

document.getElementById("total").innerText=total

}

async function checkout(){

const f=document.getElementById("checkout")

const order={
id:Date.now(),
name:f.name.value,
email:f.email.value,
phone:f.phone.value,
address:f.address.value,
country:f.country.value,
postal:f.postal.value,
items:cart,
total:cart.reduce((a,b)=>a+Number(b.price),0)
}

await fetch("/api/order",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(order)
})

localStorage.removeItem("cart")

window.location.href="https://www.paypal.me/Mohamadtohme1"

}
