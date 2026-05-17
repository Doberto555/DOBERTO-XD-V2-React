import { useState, useEffect } from "react";

// ── URL BOT RAILWAY ──
const BOT_URL = "https://doberto-xd.mooo.com";

// ── API HELPERS ──
async function checkBotStatus() {
  try {
    const r = await fetch(`${BOT_URL}/ping`);
    const d = await r.json();
    return d?.status === "active";
  } catch { return false; }
}

async function registerUser(name, phone, chain) {
  try {
    const r = await fetch(`${BOT_URL}/connect?number=${phone.replace(/\D/g,'')}`);
    const d = await r.json();
    return { ok: true, data: d };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function checkCoins(phone) {
  try {
    const num = phone.replace(/\D/g,'');
    const r = await fetch(`${BOT_URL}/api/coins/${num}`);
    const d = await r.json();
    return d;
  } catch { return { ok: false, coins: 0 }; }
}

/* ── COIN DASHBOARD MODAL ── */
function CoinDashboard({ onClose, onBuy }) {
  const [phone, setPhone] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const check = async () => {
    const num = phone.replace(/\D/g, "");
    if (num.length < 8) { setError("Entrez un numéro valide"); return; }
    setLoading(true); setError(""); setData(null);
    const res = await checkCoins(num);
    if (res.ok === false && !res.coins && res.coins !== 0) {
      setError("Numéro introuvable ou bot hors ligne.");
    } else {
      setData(res);
    }
    setLoading(false);
  };

  const coins = data?.coins ?? 0;
  const sub = data?.subscription;
  const hasCoins = coins > 0;
  const hasSub = sub?.active;

  // Couleur barre coins
  const barColor = coins === 0 ? "#ff5050" : coins <= 3 ? "#FFD166" : "#25D366";
  const barPct = Math.min((coins / 50) * 100, 100);

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,.85)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0d1a12",border:"1px solid rgba(37,211,102,.22)",borderRadius:24,padding:"2rem",maxWidth:420,width:"100%",animation:"fadeUp .3s ease"}}>

        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.3rem",color:"#e8f5e9",marginBottom:4}}>🪙 Mon Solde Coins</div>
        <p style={{color:"#7a9e8a",fontSize:".85rem",marginBottom:"1.3rem"}}>Entrez votre numéro WhatsApp pour voir votre solde en temps réel.</p>

        {/* Input nimewo */}
        <div style={{display:"flex",gap:8,marginBottom:"1rem"}}>
          <input
            type="tel"
            placeholder="+509 3700 0000"
            value={phone}
            onChange={e=>{setPhone(e.target.value);setData(null);setError("");}}
            onKeyDown={e=>e.key==="Enter"&&check()}
            style={{flex:1}}
          />
          <button onClick={check} disabled={loading} style={{background:"#25D366",color:"#000",border:"none",borderRadius:10,padding:"0 16px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:".85rem",cursor:loading?"not-allowed":"pointer",flexShrink:0}}>
            {loading?"...":"Vérifier"}
          </button>
        </div>

        {error && <div style={{color:"#ff5050",fontSize:".82rem",marginBottom:"1rem",background:"rgba(255,80,80,.08)",border:"1px solid rgba(255,80,80,.2)",borderRadius:10,padding:"8px 12px"}}>{error}</div>}

        {/* Résultat */}
        {data && (
          <div style={{animation:"fadeUp .3s ease"}}>

            {/* Solde coins */}
            <div style={{background:"rgba(37,211,102,.06)",border:`1.5px solid ${coins===0?"rgba(255,80,80,.3)":coins<=3?"rgba(255,209,102,.3)":"rgba(37,211,102,.3)"}`,borderRadius:16,padding:"1.2rem",marginBottom:"1rem"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div>
                  <div style={{fontSize:".75rem",color:"#7a9e8a",marginBottom:3}}>Coins disponibles</div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:"2.4rem",color:barColor,lineHeight:1}}>{coins}</div>
                  <div style={{fontSize:".75rem",color:"#7a9e8a",marginTop:2}}>{coins} réaction{coins!==1?"s":""} disponible{coins!==1?"s":""}</div>
                </div>
                <div style={{fontSize:"2.8rem"}}>{coins===0?"😴":coins<=3?"⚠️":"🪙"}</div>
              </div>

              {/* Barre progression */}
              <div style={{background:"rgba(255,255,255,.06)",borderRadius:50,height:8,overflow:"hidden"}}>
                <div style={{width:`${barPct}%`,height:"100%",background:`linear-gradient(90deg,${barColor},${barColor}aa)`,borderRadius:50,transition:"width .5s ease"}}/>
              </div>

              {/* Status message */}
              <div style={{marginTop:10,fontSize:".8rem",color:coins===0?"#ff5050":coins<=3?"#FFD166":"#25D366",fontWeight:600}}>
                {coins===0
                  ? "❌ Plus de coins — Rechargez pour continuer les réactions !"
                  : coins<=3
                  ? `⚠️ Attention — Plus que ${coins} coin${coins>1?"s":""} restant${coins>1?"s":""}!`
                  : `✅ Actif — ${coins} réaction${coins>1?"s":""} disponible${coins>1?"s":""}`
                }
              </div>
            </div>

            {/* Abonnement */}
            {hasSub ? (
              <div style={{background:"rgba(255,209,102,.06)",border:"1px solid rgba(255,209,102,.25)",borderRadius:14,padding:"1rem",marginBottom:"1rem"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#FFD166",fontSize:".88rem",marginBottom:6}}>📅 Abonnement Actif</div>
                <div style={{fontSize:".82rem",color:"#7a9e8a",lineHeight:1.7}}>
                  ⚡ {sub.reactionsPerPost} réaction(s) par post<br/>
                  ⏳ Expire dans <strong style={{color:"#e8f5e9"}}>{sub.daysLeft} jour{sub.daysLeft>1?"s":""}</strong><br/>
                  📅 Date : {new Date(sub.expiresAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
            ) : sub && !sub.active ? (
              <div style={{background:"rgba(255,80,80,.06)",border:"1px solid rgba(255,80,80,.2)",borderRadius:14,padding:"1rem",marginBottom:"1rem",fontSize:".82rem",color:"#ff8080"}}>
                ⏰ Abonnement expiré — Renouvelez pour continuer !
              </div>
            ) : null}

            {/* Emojis configurés */}
            {data.emojis?.length > 0 && (
              <div style={{marginBottom:"1rem"}}>
                <div style={{fontSize:".75rem",color:"#7a9e8a",marginBottom:6}}>Emojis configurés :</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {data.emojis.map((e,i)=><span key={i} style={{background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.2)",borderRadius:20,padding:"3px 10px",fontSize:"1rem"}}>{e}</span>)}
                </div>
              </div>
            )}

            {/* Bouton recharge si coins épuisés */}
            {(coins===0||coins<=3) && (
              <button onClick={()=>{onClose();onBuy();}} style={{background:"#25D366",color:"#000",border:"none",borderRadius:50,padding:".75rem 0",width:"100%",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:".9rem",cursor:"pointer",animation:"pulse-ring 2s infinite"}}>
                🪙 Recharger mes coins maintenant
              </button>
            )}
          </div>
        )}

        {!data && !loading && (
          <div style={{textAlign:"center",padding:"1rem 0",color:"#7a9e8a",fontSize:".82rem"}}>
            Entrez votre numéro et appuyez sur <strong style={{color:"#25D366"}}>Vérifier</strong>
          </div>
        )}

        <button onClick={onClose} style={{background:"transparent",border:"1px solid rgba(255,255,255,.1)",color:"#7a9e8a",borderRadius:50,padding:"8px 0",width:"100%",cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:".82rem",marginTop:"1rem"}}>Fermer</button>
      </div>
    </div>
  );
}

const EMOJIS = [
  {e:"❤️",label:"Cœur"},{e:"🔥",label:"Feu"},{e:"👍",label:"Like"},
  {e:"😂",label:"Rire"},{e:"🙏",label:"Merci"},{e:"💯",label:"100%"},
  {e:"👀",label:"Vue"},{e:"💪",label:"Force"},{e:"🎉",label:"Fête"},
  {e:"😍",label:"Amour"},{e:"🚀",label:"Fusée"},{e:"✅",label:"Validé"},
  {e:"😮",label:"Choc"},{e:"🤩",label:"Wow"},{e:"⚡",label:"Flash"},{e:"💎",label:"Diamant"},
];

const COIN_PACKS = [
  {id:"starter",coins:50, price:2.5, label:"Starter", tag:null,          color:"#7a9e8a"},
  {id:"boost",  coins:150,price:6,   label:"Boost",   tag:"⭐ Populaire",color:"#25D366"},
  {id:"pro",    coins:400,price:13,  label:"Pro",      tag:null,          color:"#FFD166"},
  {id:"elite",  coins:1000,price:28, label:"Elite",   tag:"💎 Meilleur", color:"#7bed9f"},
];

const SUB_PLANS = [
  {id:"week", label:"7 Jours", days:7,  color:"#25D366",tag:null,
   prices:{"1 réaction":1.5,"2 réactions":2.5,"3 réactions":4,"5 réactions":6}},
  {id:"month",label:"30 Jours",days:30, color:"#FFD166",tag:"🔥 Meilleure offre",
   prices:{"1 réaction":4,"2 réactions":7,"3 réactions":10,"5 réactions":15}},
];

const REACTION_COUNTS = ["1 réaction","2 réactions","3 réactions","5 réactions"];

const PAYMENT_METHODS = [
  {id:"moncash",label:"MonCash", icon:"🔴",info:"Numéro MonCash : +509 3700-0000"},
  {id:"natcash",label:"NatCash", icon:"🔵",info:"Numéro NatCash : +509 3600-0000"},
  {id:"binance",label:"Binance", icon:"🟡",info:"Adresse USDT (TRC20) : TXxxx...xxxx"},
];

const GBL = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=DM+Sans:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html{font-size:16px;}
  body{background:#060e09;font-family:'DM Sans',sans-serif;overflow-x:hidden;-webkit-text-size-adjust:100%;}

  /* ── Animations ── */
  @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes popIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
  @keyframes pulse-ring{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,.5)}50%{box-shadow:0 0 0 12px rgba(37,211,102,0)}}
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes rise{from{transform:translateY(0) rotate(0deg);opacity:.07}50%{opacity:.1}to{transform:translateY(-120vh) rotate(360deg);opacity:0}}

  /* ── Cards hover ── */
  .ch{transition:transform .3s,border-color .3s,box-shadow .3s!important;}
  .ch:hover{transform:translateY(-6px)!important;border-color:rgba(37,211,102,.5)!important;box-shadow:0 16px 40px rgba(37,211,102,.1)!important;}

  /* ── Inputs ── */
  input,select{
    background:#132018;
    border:1px solid rgba(37,211,102,.2);
    border-radius:10px;
    padding:10px 14px;
    color:#e8f5e9;
    font-family:'DM Sans',sans-serif;
    font-size:16px;
    outline:none;
    width:100%;
    transition:border-color .2s;
    -webkit-appearance:none;
    appearance:none;
  }
  input:focus,select:focus{border-color:#25D366;}
  input::placeholder{color:#7a9e8a;}

  /* ── Scrollbar ── */
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-track{background:#060e09;}
  ::-webkit-scrollbar-thumb{background:#25D366;border-radius:4px;}

  /* ── Responsive sections ── */
  section{padding-left:max(1rem,4vw);padding-right:max(1rem,4vw);}

  /* ── Prevent text overflow ── */
  p,h1,h2,h3,h4,div{word-break:break-word;overflow-wrap:break-word;}

  /* ── Buttons tap highlight ── */
  button{-webkit-tap-highlight-color:transparent;}

  /* ── Mobile small screens (<360px) ── */
  @media(max-width:360px){
    html{font-size:14px;}
  }
`;

/* ── PARTICLES ── */
function Particles(){
  const pts=Array.from({length:16},(_,i)=>({id:i,x:Math.random()*100,dur:6+Math.random()*8,delay:Math.random()*6,sym:["⚡","🔥","💚","✦","◆"][i%5]}));
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {pts.map(p=><div key={p.id} style={{position:"absolute",left:`${p.x}%`,bottom:"-10%",fontSize:18,opacity:.07,animation:`rise ${p.dur}s ${p.delay}s infinite linear`}}>{p.sym}</div>)}
    </div>
  );
}

/* ── PHONE MOCKUP ── */
function PhoneMockup(){
  const [step,setStep]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setStep(s=>(s+1)%4),1800);return()=>clearInterval(t);},[]);
  const msgs=[
    {from:"in",text:"Salut tout le monde ! 🙌",rx:["❤️","🔥"]},
    {from:"out",text:"Bienvenue sur la chaîne 💪",rx:[]},
    {from:"in",text:"Nouvelle offre dispo 👇",rx:["👀","💯","🎉"]},
    {from:"bot",text:"⚡ Doberto XD actif — réactions ON ✅",rx:[]},
  ];
  return(
    <div style={{background:"linear-gradient(145deg,#0d1f17,#091510)",border:"2px solid rgba(37,211,102,.25)",borderRadius:36,padding:"1.5rem 1rem",boxShadow:"0 0 80px rgba(37,211,102,.12),0 40px 80px rgba(0,0,0,.6)",maxWidth:300,width:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,paddingBottom:12,borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#25D366,#128C7E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#e8f5e9"}}>Chaîne VIP 🔥</div>
          <div style={{fontSize:11,color:"#7bed9f"}}>● Doberto XD actif</div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{opacity:step>=i?1:0,transform:step>=i?"translateY(0)":"translateY(8px)",transition:"all .4s ease",alignSelf:m.from==="out"?"flex-end":"flex-start",maxWidth:"82%"}}>
            <div style={{background:m.from==="bot"?"rgba(37,211,102,.15)":m.from==="out"?"#128C7E":"#1e2d24",border:m.from==="bot"?"1px solid rgba(37,211,102,.35)":"none",borderRadius:14,padding:"8px 12px",fontSize:11.5,lineHeight:1.5,color:"#e8f5e9"}}>
              {m.from==="bot"&&<div style={{color:"#25D366",fontSize:10,fontWeight:700,marginBottom:2}}>⚡ Doberto XD</div>}
              {m.text}
            </div>
            {m.rx.length>0&&<div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>{m.rx.map((r,j)=><span key={j} style={{background:"rgba(37,211,102,.12)",border:"1px solid rgba(37,211,102,.25)",borderRadius:20,padding:"2px 8px",fontSize:11}}>{r}</span>)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── PAYMENT MODAL ── */
function PayModal({item,onClose}){
  const [method,setMethod]=useState(null);
  const [step,setStep]=useState("choose");
  const [txid,setTxid]=useState("");
  const pm=PAYMENT_METHODS.find(p=>p.id===method);

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,.85)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0d1a12",border:"1px solid rgba(37,211,102,.22)",borderRadius:24,padding:"2rem",maxWidth:460,width:"100%",animation:"fadeUp .3s ease",boxShadow:"0 0 60px rgba(37,211,102,.1)"}}>

        {step==="done"?(
          <div style={{textAlign:"center",padding:"1rem 0"}}>
            <div style={{fontSize:"3rem",marginBottom:8}}>✅</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.3rem",color:"#e8f5e9",marginBottom:8}}>Paiement en vérification</div>
            <p style={{color:"#7a9e8a",fontSize:".88rem",lineHeight:1.6,marginBottom:"1.5rem"}}>Notre équipe vérifiera votre paiement et activera votre accès sous <strong style={{color:"#25D366"}}>15 minutes</strong>.</p>
            <div style={{background:"rgba(37,211,102,.08)",border:"1px solid rgba(37,211,102,.2)",borderRadius:12,padding:12,marginBottom:"1.5rem",fontFamily:"'Syne',sans-serif",fontSize:".82rem",color:"#25D366"}}>Réf : {txid}</div>
            <button onClick={onClose} style={{background:"#25D366",color:"#000",border:"none",padding:"10px 28px",borderRadius:50,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:700}}>Fermer</button>
          </div>

        ):step==="info"&&pm?(
          <>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.2rem",color:"#e8f5e9",marginBottom:4}}>Paiement via {pm.label} {pm.icon}</div>
            <div style={{background:"rgba(37,211,102,.08)",border:"1px solid rgba(37,211,102,.2)",borderRadius:12,padding:14,marginBottom:"1.2rem"}}>
              <div style={{fontSize:".8rem",color:"#7a9e8a",marginBottom:4}}>Montant à envoyer</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.5rem",color:"#25D366"}}>${item.price} USD</div>
              <div style={{fontSize:".75rem",color:"#7a9e8a",marginTop:4}}>{item.label}</div>
            </div>
            <div style={{background:"rgba(255,209,102,.06)",border:"1px solid rgba(255,209,102,.2)",borderRadius:12,padding:12,marginBottom:"1.2rem",fontSize:".85rem",color:"#FFD166",lineHeight:1.6}}>
              📋 <strong>{pm.info}</strong>
            </div>
            <p style={{color:"#7a9e8a",fontSize:".82rem",marginBottom:"1rem",lineHeight:1.6}}>Collez votre <strong style={{color:"#e8f5e9"}}>numéro de transaction / référence</strong> ci-dessous :</p>
            <input value={txid} onChange={e=>setTxid(e.target.value)} placeholder="Ex: MC-123456789 ou hash Binance..." style={{marginBottom:"1.2rem"}}/>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setStep("choose")} style={{background:"transparent",border:"1px solid rgba(255,255,255,.12)",color:"#7a9e8a",padding:"8px 18px",borderRadius:50,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:".85rem"}}>← Retour</button>
              <button onClick={()=>{if(!txid.trim()){alert("Veuillez entrer votre référence 🙏");return;}setStep("done");}} style={{background:"#25D366",color:"#000",border:"none",padding:"8px 20px",borderRadius:50,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:".9rem"}}>Confirmer ✅</button>
            </div>
          </>

        ):(
          <>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.2rem",color:"#e8f5e9",marginBottom:4}}>Mode de paiement</div>
            <div style={{color:"#7a9e8a",fontSize:".85rem",marginBottom:"1.2rem"}}>Pour : <strong style={{color:"#25D366"}}>{item.label}</strong> — <strong style={{color:"#FFD166"}}>${item.price} USD</strong></div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:"1.5rem"}}>
              {PAYMENT_METHODS.map(p=>(
                <button key={p.id} onClick={()=>{setMethod(p.id);setStep("info");}} style={{background:"#132018",border:"1.5px solid rgba(37,211,102,.15)",borderRadius:14,padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all .2s",textAlign:"left"}}>
                  <span style={{fontSize:"1.6rem"}}>{p.icon}</span>
                  <div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#e8f5e9",fontSize:".95rem"}}>{p.label}</div>
                    <div style={{fontSize:".75rem",color:"#7a9e8a"}}>Payer en {p.id==="binance"?"USDT":"HTG/USD"}</div>
                  </div>
                  <span style={{marginLeft:"auto",color:"#25D366",fontSize:"1.1rem"}}>→</span>
                </button>
              ))}
            </div>
            <button onClick={onClose} style={{background:"transparent",border:"1px solid rgba(255,255,255,.1)",color:"#7a9e8a",padding:"8px 18px",borderRadius:50,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:".85rem",width:"100%"}}>Annuler</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── REGISTER MODAL ── */
function RegisterModal({onClose}){
  const [done,setDone]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [chainValid,setChainValid]=useState(null); // null | true | false
  const [form,setForm]=useState({name:"",phone:"",chainLink:"",chainType:""});

  // Valide link chèn nan
  const validateChainLink=(link)=>{
    const ok = link.includes("whatsapp.com/channel/") || link.includes("chat.whatsapp.com/");
    setChainValid(link.length>0 ? ok : null);
    return ok;
  };

  const submit=async()=>{
    if(!form.name||!form.phone||!form.chainLink||!form.chainType){
      setError("Veuillez remplir tous les champs 🙏");return;
    }
    if(!validateChainLink(form.chainLink)){
      setError("Le lien de chaîne est invalide. Il doit contenir whatsapp.com/channel/");return;
    }
    setLoading(true);
    setError("");
    try{
      // Ekstrè JID chèn nan soti nan link lan
      const channelId = form.chainLink.split("/channel/")[1]?.split("/")[0]
                     || form.chainLink.split("chat.whatsapp.com/")[1]?.split("/")[0];

      // Voye enskripsyon bay bot la
      const r = await fetch(`${BOT_URL}/newsletter/add`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          jid: channelId ? `${channelId}@newsletter` : form.chainLink,
          number: form.phone.replace(/\D/g,""),
          name: form.name,
          chainType: form.chainType,
          emojis: ["❤️","🔥","👍"],
        })
      });
      // Meme si bot la pa reponn, nou montre siksè
      setDone(true);
    }catch(e){
      // Toujou montre siksè — admin va verifye manyèlman
      setDone(true);
    }
    setLoading(false);
  };

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.8)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0d1a12",border:"1px solid rgba(37,211,102,.2)",borderRadius:24,padding:"2rem",maxWidth:460,width:"100%",animation:"fadeUp .3s ease",margin:"auto"}}>
        {!done?(<>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.4rem",color:"#e8f5e9",marginBottom:6}}>🚀 Créer mon compte</div>
          <p style={{color:"#7a9e8a",fontSize:".88rem",lineHeight:1.6,marginBottom:"1.5rem"}}>Inscription gratuite + <strong style={{color:"#25D366"}}>10 coins offerts</strong> pour commencer !</p>

          {/* Nom */}
          <div style={{marginBottom:"1rem"}}>
            <label style={{display:"block",fontSize:".78rem",fontWeight:600,color:"#7a9e8a",marginBottom:6}}>Votre nom</label>
            <input type="text" placeholder="Ex : Jean Pierre" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
          </div>

          {/* Nimewo */}
          <div style={{marginBottom:"1rem"}}>
            <label style={{display:"block",fontSize:".78rem",fontWeight:600,color:"#7a9e8a",marginBottom:6}}>Numéro WhatsApp</label>
            <input type="tel" placeholder="+509 3700 0000" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/>
          </div>

          {/* Link chèn — NOUVO */}
          <div style={{marginBottom:"1rem"}}>
            <label style={{display:"block",fontSize:".78rem",fontWeight:600,color:"#7a9e8a",marginBottom:6}}>
              🔗 Lien de votre chaîne WhatsApp
            </label>
            <input
              type="url"
              placeholder="https://whatsapp.com/channel/xxx..."
              value={form.chainLink}
              onChange={e=>{setForm(p=>({...p,chainLink:e.target.value}));validateChainLink(e.target.value);}}
              style={{borderColor: chainValid===true?"#25D366": chainValid===false?"#ff5050":"rgba(37,211,102,.2)"}}
            />
            {/* Feedback validasyon */}
            {chainValid===true && <div style={{color:"#25D366",fontSize:".75rem",marginTop:4}}>✅ Lien valide !</div>}
            {chainValid===false && <div style={{color:"#ff5050",fontSize:".75rem",marginTop:4}}>❌ Lien invalide — copiez le lien depuis WhatsApp → Chaîne → Inviter</div>}
            <div style={{color:"#7a9e8a",fontSize:".72rem",marginTop:4,lineHeight:1.5}}>
              💡 WhatsApp → votre chaîne → <strong style={{color:"#e8f5e9"}}>⋮ → Lien d'invitation</strong>
            </div>
          </div>

          {/* Type chèn */}
          <div style={{marginBottom:"1.5rem"}}>
            <label style={{display:"block",fontSize:".78rem",fontWeight:600,color:"#7a9e8a",marginBottom:6}}>Type de chaîne</label>
            <select value={form.chainType} onChange={e=>setForm(p=>({...p,chainType:e.target.value}))}>
              <option value="">-- Choisissez --</option>
              <option>Chaîne WhatsApp (Newsletter)</option>
              <option>Groupe WhatsApp</option>
              <option>Chaîne Commerciale / Business</option>
              <option>Communauté</option>
            </select>
          </div>

          {error&&<div style={{color:"#ff5050",fontSize:".82rem",marginBottom:"1rem",background:"rgba(255,80,80,.08)",border:"1px solid rgba(255,80,80,.2)",borderRadius:10,padding:"8px 12px"}}>{error}</div>}

          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button onClick={onClose} style={{background:"transparent",border:"1px solid rgba(255,255,255,.12)",color:"#7a9e8a",padding:"8px 18px",borderRadius:50,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:".85rem"}}>Annuler</button>
            <button onClick={submit} disabled={loading} style={{background:loading?"#1a5c38":"#25D366",color:"#000",border:"none",padding:"8px 20px",borderRadius:50,cursor:loading?"not-allowed":"pointer",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:".88rem",opacity:loading?.7:1}}>
              {loading?"⏳ Connexion au bot...":"S'inscrire → 10 Coins ⚡"}
            </button>
          </div>
        </>):(
          <div style={{textAlign:"center",padding:"1rem 0"}}>
            <div style={{fontSize:"3rem",marginBottom:8}}>🎉</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.3rem",color:"#e8f5e9",marginBottom:8}}>Inscription réussie !</div>

            {/* Résumé chaîne */}
            <div style={{background:"rgba(37,211,102,.08)",border:"1px solid rgba(37,211,102,.2)",borderRadius:14,padding:"12px 16px",marginBottom:"1rem",textAlign:"left"}}>
              <div style={{fontSize:".75rem",color:"#7a9e8a",marginBottom:6}}>📋 Récapitulatif</div>
              <div style={{fontSize:".85rem",color:"#e8f5e9",marginBottom:4}}>👤 <strong>{form.name}</strong></div>
              <div style={{fontSize:".85rem",color:"#e8f5e9",marginBottom:4}}>📱 <strong>{form.phone}</strong></div>
              <div style={{fontSize:".82rem",color:"#25D366",wordBreak:"break-all"}}>🔗 {form.chainLink}</div>
            </div>

            <p style={{color:"#7a9e8a",fontSize:".85rem",lineHeight:1.6,marginBottom:"1.5rem"}}>
              Le bot va rejoindre votre chaîne et commencer les réactions automatiques. Vous recevrez vos <strong style={{color:"#25D366"}}>10 coins</strong> sur WhatsApp dans quelques minutes.
            </p>

            {/* Étapes suivantes */}
            <div style={{background:"rgba(255,209,102,.06)",border:"1px solid rgba(255,209,102,.15)",borderRadius:12,padding:"12px",marginBottom:"1.5rem",textAlign:"left"}}>
              <div style={{fontSize:".75rem",color:"#FFD166",fontWeight:700,marginBottom:6}}>⚡ Prochaines étapes</div>
              <div style={{fontSize:".8rem",color:"#7a9e8a",lineHeight:1.8}}>
                1. Bot rejoint votre chaîne automatiquement<br/>
                2. Vous recevez 10 coins sur WhatsApp<br/>
                3. Chaque post = 1 réaction automatique<br/>
                4. Rechargez quand les coins sont épuisés
              </div>
            </div>

            <button onClick={onClose} style={{background:"#25D366",color:"#000",border:"none",padding:"10px 28px",borderRadius:50,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:700}}>Parfait ! 🚀</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PRICING PAGE ── */
function PricingPage({onBuy}){
  const [tab,setTab]=useState("coins");
  const [rxCount,setRxCount]=useState("1 réaction");

  const TabBtn=({id,label})=>(
    <button onClick={()=>setTab(id)} style={{background:tab===id?"#25D366":"transparent",color:tab===id?"#000":"#7a9e8a",border:`1.5px solid ${tab===id?"#25D366":"rgba(37,211,102,.2)"}`,borderRadius:50,padding:".55rem 1.4rem",cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:".9rem",transition:"all .2s"}}>{label}</button>
  );

  return(
    <section id="pricing" style={{position:"relative",zIndex:1,padding:"5rem 1.5rem",maxWidth:1100,margin:"0 auto"}}>
      <div style={{position:"absolute",top:"10%",left:"50%",transform:"translateX(-50%)",width:700,height:300,background:"radial-gradient(ellipse,rgba(37,211,102,.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <p style={{fontSize:".72rem",letterSpacing:".12em",textTransform:"uppercase",color:"#25D366",fontWeight:600,marginBottom:6}}>Tarifs</p>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"clamp(1.8rem,4vw,2.8rem)",color:"#e8f5e9",marginBottom:".8rem"}}>Choisissez votre formule</h2>
      <p style={{color:"#7a9e8a",maxWidth:600,lineHeight:1.7,marginBottom:"2.5rem"}}>
        Deux systèmes : <strong style={{color:"#25D366"}}>Coins à la carte</strong> (1 coin = 1 réaction sur 1 post, rechargez quand épuisé) ou <strong style={{color:"#FFD166"}}>Abonnement</strong> (réactions automatiques sur chaque post pendant 7 ou 30 jours).
      </p>

      <div style={{display:"flex",gap:10,marginBottom:"2.5rem",flexWrap:"wrap"}}>
        <TabBtn id="coins" label="🪙 Coins à la carte"/>
        <TabBtn id="sub"   label="📅 Abonnement Durée"/>
      </div>

      {/* COINS */}
      {tab==="coins"&&(
        <>
          <div style={{background:"rgba(37,211,102,.07)",border:"1px solid rgba(37,211,102,.2)",borderRadius:16,padding:"1rem 1.4rem",marginBottom:"1.5rem",display:"flex",gap:14,alignItems:"flex-start"}}>
            <span style={{fontSize:"1.5rem"}}>🪙</span>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#e8f5e9",marginBottom:4}}>Comment fonctionnent les Coins ?</div>
              <p style={{color:"#7a9e8a",fontSize:".85rem",lineHeight:1.65}}>Chaque <strong style={{color:"#25D366"}}>1 coin = 1 réaction automatique</strong> sur 1 post. Dès que votre solde tombe à 0, les réactions s'arrêtent et vous devez racheter des coins pour continuer.</p>
            </div>
          </div>
          <div style={{background:"linear-gradient(135deg,rgba(37,211,102,.12),rgba(18,140,126,.08))",border:"1px solid rgba(37,211,102,.3)",borderRadius:16,padding:"1.2rem 1.5rem",marginBottom:"2rem",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1rem",color:"#e8f5e9"}}>🎁 10 Coins offerts à l'inscription !</div>
              <div style={{color:"#7a9e8a",fontSize:".82rem",marginTop:3}}>Créez votre compte gratuitement et testez le bot tout de suite.</div>
            </div>
            <span style={{background:"#25D366",color:"#000",borderRadius:50,padding:".4rem 1rem",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:".82rem",whiteSpace:"nowrap"}}>GRATUIT</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"1.2rem"}}>
            {COIN_PACKS.map(pk=>(
              <div key={pk.id} className="ch" style={{background:"#0d1a12",border:`1px solid ${pk.tag?"rgba(37,211,102,.35)":"rgba(37,211,102,.15)"}`,borderRadius:20,padding:"1.8rem 1.5rem",position:"relative"}}>
                {pk.tag&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:pk.color,color:"#000",borderRadius:50,padding:".25rem .9rem",fontSize:".72rem",fontFamily:"'Syne',sans-serif",fontWeight:700,whiteSpace:"nowrap"}}>{pk.tag}</div>}
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1rem",color:pk.color,marginBottom:8}}>{pk.label}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:"2.2rem",color:"#e8f5e9",lineHeight:1}}>{pk.coins}</div>
                <div style={{color:"#7a9e8a",fontSize:".78rem",marginBottom:16}}>coins · {pk.coins} réactions</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"1.3rem",color:"#FFD166",marginBottom:8}}>${pk.price} USD</div>
                <div style={{color:"#7a9e8a",fontSize:".75rem",marginBottom:"1.2rem"}}>≈ ${(pk.price/pk.coins).toFixed(3)} / réaction</div>
                <button onClick={()=>onBuy({label:`${pk.label} — ${pk.coins} Coins`,price:pk.price})} style={{background:pk.tag?"#25D366":"transparent",border:`1.5px solid ${pk.tag?"#25D366":"rgba(37,211,102,.3)"}`,color:pk.tag?"#000":"#25D366",borderRadius:50,padding:".65rem 0",width:"100%",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:".9rem",cursor:"pointer",transition:"all .2s"}}>
                  Acheter {pk.coins} Coins ⚡
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* SUBSCRIPTION */}
      {tab==="sub"&&(
        <>
          <div style={{background:"rgba(255,209,102,.07)",border:"1px solid rgba(255,209,102,.2)",borderRadius:16,padding:"1rem 1.4rem",marginBottom:"1.5rem",display:"flex",gap:14,alignItems:"flex-start"}}>
            <span style={{fontSize:"1.5rem"}}>📅</span>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#e8f5e9",marginBottom:4}}>Comment fonctionne l'Abonnement ?</div>
              <p style={{color:"#7a9e8a",fontSize:".85rem",lineHeight:1.65}}>
                Payez une fois pour <strong style={{color:"#FFD166"}}>7 ou 30 jours</strong>. Le bot place des réactions automatiques <strong style={{color:"#25D366"}}>sous chaque post</strong> que vous publiez. Choisissez combien d'emojis par post. À l'expiration, vous recevez un rappel et devez renouveler manuellement.
              </p>
            </div>
          </div>

          <div style={{marginBottom:"2rem"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#e8f5e9",marginBottom:10,fontSize:".9rem"}}>Nombre de réactions par post :</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {REACTION_COUNTS.map(rc=>(
                <button key={rc} onClick={()=>setRxCount(rc)} style={{background:rxCount===rc?"rgba(37,211,102,.2)":"#0d1a12",border:`1.5px solid ${rxCount===rc?"rgba(37,211,102,.6)":"rgba(37,211,102,.18)"}`,color:rxCount===rc?"#e8f5e9":"#7a9e8a",borderRadius:50,padding:".45rem 1rem",cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:".85rem",transition:"all .2s"}}>{rc}</button>
              ))}
            </div>
            <div style={{marginTop:10,color:"#7a9e8a",fontSize:".8rem"}}>
              💡 Plus vous ajoutez de réactions par post, plus l'engagement de votre chaîne augmente — et plus le tarif est élevé.
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1.5rem",marginBottom:"2rem"}}>
            {SUB_PLANS.map(plan=>{
              const price=plan.prices[rxCount];
              return(
                <div key={plan.id} className="ch" style={{background:"#0d1a12",border:`1.5px solid ${plan.tag?"rgba(255,209,102,.35)":"rgba(37,211,102,.2)"}`,borderRadius:24,padding:"2rem 1.8rem",position:"relative"}}>
                  {plan.tag&&<div style={{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",background:"#FFD166",color:"#000",borderRadius:50,padding:".25rem .9rem",fontSize:".72rem",fontFamily:"'Syne',sans-serif",fontWeight:700,whiteSpace:"nowrap"}}>{plan.tag}</div>}
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.1rem",color:plan.color,marginBottom:6}}>{plan.label}</div>
                  <div style={{color:"#7a9e8a",fontSize:".82rem",marginBottom:"1.2rem"}}>Actif {plan.days} jours · renouvellement manuel</div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:"2.4rem",color:"#e8f5e9",lineHeight:1,marginBottom:4}}>${price}<span style={{fontSize:"1rem",color:"#7a9e8a"}}> USD</span></div>
                  <div style={{color:"#7a9e8a",fontSize:".78rem",marginBottom:"1.5rem"}}>{rxCount} par post · {plan.days} jours</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:"1.5rem"}}>
                    {[
                      `✅ Réactions auto sous chaque post`,
                      `✅ ${rxCount} emoji(s) par publication`,
                      `✅ Actif ${plan.days} jours sans interruption`,
                      `✅ Rappel WhatsApp avant expiration`,
                      plan.id==="month"?"✅ Économie vs abonnement 7j":"⚡ Parfait pour tester",
                    ].map((f,i)=><div key={i} style={{color:"#7a9e8a",fontSize:".82rem"}}>{f}</div>)}
                  </div>
                  <button onClick={()=>onBuy({label:`Abonnement ${plan.label} — ${rxCount}`,price})} style={{background:plan.id==="month"?"#FFD166":"#25D366",color:"#000",border:"none",borderRadius:50,padding:".75rem 0",width:"100%",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:".95rem",cursor:"pointer"}}>
                    Souscrire {plan.label} →
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{background:"rgba(37,211,102,.05)",border:"1px solid rgba(37,211,102,.15)",borderRadius:14,padding:"1rem 1.4rem",display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:"1.2rem"}}>🔔</span>
            <p style={{color:"#7a9e8a",fontSize:".82rem",lineHeight:1.6}}>
              <strong style={{color:"#e8f5e9"}}>Rappel de renouvellement :</strong> Vous recevrez un message WhatsApp <strong style={{color:"#25D366"}}>2 jours avant</strong> l'expiration. Sans renouvellement, les réactions automatiques s'arrêtent à la date d'expiration et vous devez repayer pour continuer.
            </p>
          </div>
        </>
      )}
    </section>
  );
}

/* ── MAIN APP ── */
export default function App(){
  const [page,setPage]=useState("home");
  const [regModal,setRegModal]=useState(false);
  const [payModal,setPayModal]=useState(null);
  const [coinModal,setCoinModal]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  const [activeEmoji,setActiveEmoji]=useState(null);
  const [botOnline,setBotOnline]=useState(null); // null=ap verifye, true=online, false=offline

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>30);
    window.addEventListener("scroll",h);
    return()=>window.removeEventListener("scroll",h);
  },[]);

  // Verifye si bot la online chak 30 segonn
  useEffect(()=>{
    checkBotStatus().then(ok=>setBotOnline(ok));
    const t=setInterval(()=>checkBotStatus().then(ok=>setBotOnline(ok)),30000);
    return()=>clearInterval(t);
  },[]);

  return(
    <>
      <style>{GBL}</style>
      <Particles/>

      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 1rem",height:52,background:scrolled?"rgba(6,14,9,.95)":"rgba(6,14,9,.7)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(37,211,102,.1)",transition:"all .3s",gap:8}}>

        {/* LOGO — yon sèl liy */}
        <button onClick={()=>setPage("home")} style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:"1.1rem",color:"#25D366",display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
          ⚡ Doberto XD
        </button>

        {/* DWAT — status + bouton yo */}
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>

          {/* Status — ti pwen sèlman sou mobil */}
          <div title={botOnline===null?"Vérification...":botOnline?"Bot Actif":"Bot Hors ligne"} style={{display:"flex",alignItems:"center",gap:4,background:"rgba(0,0,0,.4)",border:`1px solid ${botOnline===true?"rgba(37,211,102,.4)":botOnline===false?"rgba(255,80,80,.4)":"rgba(255,200,0,.4)"}`,borderRadius:50,padding:"4px 8px",cursor:"default"}}>
            <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,background:botOnline===true?"#25D366":botOnline===false?"#ff5050":"#FFD166",animation:botOnline===true?"pulse-ring 2s infinite":"none"}}/>
            {/* Tèks — kache sou ti ekran */}
            <span style={{color:botOnline===true?"#25D366":botOnline===false?"#ff5050":"#FFD166",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:".68rem",display:"block"}}>
              {botOnline===null?"...":botOnline?"Actif":"Off"}
            </span>
          </div>

          {/* Tarifs */}
          <button onClick={()=>setPage(page==="pricing"?"home":"pricing")} style={{background:"transparent",border:"1px solid rgba(37,211,102,.25)",color:"#e8f5e9",borderRadius:50,padding:".38rem .85rem",cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:".78rem",whiteSpace:"nowrap",transition:"all .2s"}}>
            {page==="pricing"?"← Accueil":"Tarifs"}
          </button>

          {/* Mon Solde */}
          <button onClick={()=>setCoinModal(true)} style={{background:"rgba(255,209,102,.12)",border:"1px solid rgba(255,209,102,.3)",color:"#FFD166",borderRadius:50,padding:".38rem .85rem",cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:".78rem",whiteSpace:"nowrap"}}>
            🪙 Solde
          </button>

          {/* Démarrer */}
          <button onClick={()=>setRegModal(true)} style={{background:"#25D366",color:"#000",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:".8rem",padding:".4rem 1rem",borderRadius:50,border:"none",cursor:"pointer",whiteSpace:"nowrap",animation:"pulse-ring 2.5s infinite"}}>
            Démarrer
          </button>
        </div>
      </nav>

      {page==="pricing"
        ?<PricingPage onBuy={item=>setPayModal(item)}/>
        :(
        <>
          {/* HERO */}
          <section style={{position:"relative",zIndex:1,textAlign:"center",padding:"5rem 1.2rem 3rem",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:"min(600px,100%)",height:400,background:"radial-gradient(ellipse,rgba(37,211,102,.1) 0%,transparent 70%)",pointerEvents:"none"}}/>

            {/* Badge — raccourci, yon sèl liy */}
            <div style={{animation:"fadeUp .6s ease both",background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.25)",borderRadius:50,padding:".3rem .9rem",display:"inline-flex",alignItems:"center",gap:5,fontSize:".72rem",color:"#25D366",marginBottom:"1.2rem",whiteSpace:"nowrap",maxWidth:"90vw",overflow:"hidden",textOverflow:"ellipsis"}}>
              ⚡ Auto-Réaction WhatsApp — DOBERTO MR LIT
            </div>

            {/* Titre — adapte selon ecran */}
            <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:"clamp(1.9rem,8vw,4.5rem)",lineHeight:1.1,animation:"fadeUp .7s .1s ease both",color:"#e8f5e9",maxWidth:"min(800px,92vw)",margin:"0 auto .5rem"}}>
              Réactions{" "}
              <span style={{background:"linear-gradient(90deg,#25D366,#7bed9f,#25D366)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 3s linear infinite"}}>Auto</span>
              {" "}sur WhatsApp
            </h1>

            {/* Sous-titre */}
            <p style={{animation:"fadeUp .7s .2s ease both",maxWidth:"min(520px,88vw)",margin:"1.2rem auto 2rem",color:"#7a9e8a",fontSize:"clamp(.88rem,3.5vw,1rem)",lineHeight:1.7}}>
              Le bot de <strong style={{color:"#25D366"}}>DOBERTO MR LIT</strong> réagit automatiquement sous chaque post de votre chaîne. <strong style={{color:"#FFD166"}}>10 coins offerts</strong> à l'inscription !
            </p>

            {/* Boutons — stack sou mobil */}
            <div style={{animation:"fadeUp .7s .3s ease both",display:"flex",flexDirection:"column",alignItems:"center",gap:10,marginBottom:"3rem",width:"100%",maxWidth:320}}>
              <button onClick={()=>setRegModal(true)} style={{background:"#25D366",color:"#000",fontFamily:"'Syne',sans-serif",fontWeight:700,padding:".85rem 0",borderRadius:50,border:"none",cursor:"pointer",fontSize:"clamp(.88rem,4vw,.98rem)",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                🚀 Démarrer — 10 Coins Gratuits
              </button>
              <button onClick={()=>setPage("pricing")} style={{background:"transparent",border:"1.5px solid rgba(37,211,102,.25)",color:"#e8f5e9",fontFamily:"'Syne',sans-serif",fontWeight:600,padding:".75rem 0",borderRadius:50,cursor:"pointer",fontSize:"clamp(.85rem,3.5vw,.95rem)",width:"100%"}}>
                💰 Voir les tarifs
              </button>
            </div>

            <div style={{animation:"float 5s ease-in-out infinite",position:"relative",zIndex:1,width:"100%",display:"flex",justifyContent:"center"}}>
              <PhoneMockup/>
            </div>
          </section>

          {/* HOW */}
          <section style={{position:"relative",zIndex:1,padding:"5rem 1.5rem",maxWidth:1100,margin:"0 auto"}}>
            <p style={{fontSize:".72rem",letterSpacing:".12em",textTransform:"uppercase",color:"#25D366",fontWeight:600,marginBottom:6}}>Comment ça marche</p>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"clamp(1.8rem,4vw,2.8rem)",color:"#e8f5e9",marginBottom:".8rem"}}>Simple en 4 étapes</h2>
            <p style={{color:"#7a9e8a",maxWidth:520,lineHeight:1.7,marginBottom:"3rem"}}>Aucune compétence technique requise. Actif en moins de 2 minutes.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"1.2rem"}}>
              {[
                {n:"01",t:"Inscrivez-vous",d:"Compte gratuit + 10 coins offerts immédiatement pour tester le bot."},
                {n:"02",t:"Connectez WhatsApp",d:"Scannez le QR code pour lier votre numéro à Doberto XD en toute sécurité."},
                {n:"03",t:"Choisissez votre formule",d:"Coins à la carte ou abonnement 7/30 jours selon votre usage."},
                {n:"04",t:"Réactions automatiques",d:"Le bot réagit sous chaque post. Rechargez coins ou renouvelez l'abonnement si nécessaire."},
              ].map(s=>(
                <div key={s.n} className="ch" style={{background:"#0d1a12",border:"1px solid rgba(37,211,102,.15)",borderRadius:20,padding:"1.8rem 1.5rem"}}>
                  <div style={{width:42,height:42,borderRadius:12,background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#25D366",marginBottom:"1.2rem",fontSize:".88rem"}}>{s.n}</div>
                  <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"1rem",color:"#e8f5e9",marginBottom:".5rem"}}>{s.t}</h3>
                  <p style={{color:"#7a9e8a",fontSize:".85rem",lineHeight:1.65}}>{s.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* EMOJIS */}
          <section style={{position:"relative",zIndex:1,padding:"4rem 1.5rem",maxWidth:900,margin:"0 auto",textAlign:"center"}}>
            <p style={{fontSize:".72rem",letterSpacing:".12em",textTransform:"uppercase",color:"#25D366",fontWeight:600,marginBottom:6}}>Réactions disponibles</p>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"clamp(1.6rem,3.5vw,2.4rem)",color:"#e8f5e9",marginBottom:"2rem"}}>Tous les emojis WhatsApp supportés</h2>
            <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center"}}>
              {EMOJIS.map(em=>(
                <button key={em.e} onMouseEnter={()=>setActiveEmoji(em.e)} onMouseLeave={()=>setActiveEmoji(null)} style={{background:activeEmoji===em.e?"rgba(37,211,102,.2)":"#0d1a12",border:`1px solid ${activeEmoji===em.e?"rgba(37,211,102,.5)":"rgba(37,211,102,.15)"}`,borderRadius:40,padding:".5rem 1rem",display:"inline-flex",alignItems:"center",gap:6,color:activeEmoji===em.e?"#e8f5e9":"#7a9e8a",fontSize:".85rem",cursor:"pointer",transform:activeEmoji===em.e?"scale(1.1)":"scale(1)",transition:"all .2s",fontFamily:"'DM Sans',sans-serif"}}>
                  <span style={{fontSize:"1.1rem"}}>{em.e}</span>{em.label}
                </button>
              ))}
              <div style={{background:"#0d1a12",border:"1px solid rgba(37,211,102,.15)",borderRadius:40,padding:".5rem 1.2rem",color:"#25D366",fontSize:".85rem",fontFamily:"'Syne',sans-serif",fontWeight:700}}>+200 autres</div>
            </div>
          </section>

          {/* CTA */}
          <section style={{position:"relative",zIndex:1,padding:"2rem 1.5rem 5rem",maxWidth:900,margin:"0 auto"}}>
            <div style={{background:"linear-gradient(135deg,rgba(37,211,102,.1) 0%,rgba(18,140,126,.06) 100%)",border:"1px solid rgba(37,211,102,.2)",borderRadius:28,padding:"4rem 2rem",textAlign:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-60,right:-60,width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(37,211,102,.12) 0%,transparent 70%)"}}/>
              <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"clamp(1.8rem,4vw,2.6rem)",color:"#e8f5e9",marginBottom:"1rem"}}>Prêt à automatiser ?</h2>
              <p style={{color:"#7a9e8a",maxWidth:460,margin:"0 auto 2rem",lineHeight:1.7}}>Commencez avec <strong style={{color:"#25D366"}}>10 coins gratuits</strong>, rechargez à la carte ou souscrivez un abonnement 7 ou 30 jours.</p>
              <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
                <button onClick={()=>setRegModal(true)} style={{background:"#25D366",color:"#000",fontFamily:"'Syne',sans-serif",fontWeight:700,padding:"1rem 2.2rem",borderRadius:50,border:"none",cursor:"pointer",fontSize:"1rem",animation:"pulse-ring 2.5s infinite"}}>
                  🎁 10 Coins Gratuits
                </button>
                <button onClick={()=>setPage("pricing")} style={{background:"transparent",border:"1.5px solid rgba(255,209,102,.35)",color:"#FFD166",fontFamily:"'Syne',sans-serif",fontWeight:700,padding:"1rem 2rem",borderRadius:50,cursor:"pointer",fontSize:"1rem"}}>
                  💰 Voir les tarifs
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer style={{borderTop:"1px solid rgba(37,211,102,.1)",padding:"2.5rem 1.2rem 2rem",position:"relative",zIndex:1}}>

        {/* Contact cards */}
        <div style={{maxWidth:500,margin:"0 auto 2rem",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[
            {num:"50935878442",label:"WhatsApp 1"},
            {num:"50939492644",label:"WhatsApp 2"},
          ].map(c=>(
            <a key={c.num} href={`https://wa.me/${c.num}`} target="_blank" rel="noreferrer"
              style={{background:"rgba(37,211,102,.08)",border:"1px solid rgba(37,211,102,.2)",borderRadius:16,padding:"1rem",textDecoration:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:6,transition:"all .2s"}}>
              <span style={{fontSize:"1.6rem"}}>💬</span>
              <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:".78rem",color:"#25D366"}}>{c.label}</span>
              <span style={{fontSize:".75rem",color:"#7a9e8a",letterSpacing:".03em"}}>+{c.num}</span>
              <span style={{background:"#25D366",color:"#000",borderRadius:50,padding:"3px 12px",fontSize:".7rem",fontFamily:"'Syne',sans-serif",fontWeight:700,marginTop:2}}>Contacter</span>
            </a>
          ))}
        </div>

        {/* Pèman */}
        <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
          <div style={{fontSize:".72rem",color:"#7a9e8a",marginBottom:8,letterSpacing:".08em",textTransform:"uppercase"}}>Modes de paiement</div>
          <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
            {[{i:"🔴",l:"MonCash"},{i:"🔵",l:"NatCash"},{i:"🟡",l:"Binance"}].map(p=>(
              <div key={p.l} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:50,padding:"4px 14px",fontSize:".78rem",color:"#7a9e8a",display:"flex",alignItems:"center",gap:5}}>
                {p.i} {p.l}
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div style={{textAlign:"center",borderTop:"1px solid rgba(255,255,255,.05)",paddingTop:"1.2rem"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#25D366",fontSize:"1rem",marginBottom:6}}>⚡ Doberto XD</div>
          <p style={{color:"#7a9e8a",fontSize:".75rem"}}>© 2026 — Développé par <strong style={{color:"#25D366"}}>DOBERTO MR LIT</strong></p>
        </div>
      </footer>

      {regModal&&<RegisterModal onClose={()=>setRegModal(false)}/>}
      {payModal&&<PayModal item={payModal} onClose={()=>setPayModal(null)}/>}
      {coinModal&&<CoinDashboard onClose={()=>setCoinModal(false)} onBuy={()=>setPage("pricing")}/>}
    </>
  );
}
