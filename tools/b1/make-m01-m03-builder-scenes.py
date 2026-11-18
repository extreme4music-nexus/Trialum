import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
assets=json.loads((ROOT/'assets/m01-m03-catalog-additions.json').read_text())
def project(key,title,data,columns=5,step=2.9):
    items=[]
    for i,asset in enumerate(data):
        row,col=divmod(i,columns)
        x=round((col-(columns-1)/2)*step,4)
        z=round((row-(max(1,(len(data)+columns-1)//columns)-1)/2)*step,4)
        items.append({'id':key+'-'+str(i+1),'assetId':asset['id'],'label':asset['name'][:88],
           'position':[x,0,z],'rotationY':0,'scale':[1,1,1],
           'layer':'floor','locked':False,'visible':True,'binding':'','note':'REAL metal GLB. GLB visually inspected only by automated offscreen renderer; owner device QA pending'})
    p={'schemaVersion':1,'projectId':key,'name':title,'description':'Genuine owner-render-approved 3D modular metallic tile review; 0 gameplay writes. Select individual meshes to examine construction.',
       'room':{'gridSize':.1,'showWalls':False,'floorColor':'#34454b','wallColor':'#42505a','width':max(12,columns*step+3),'depth':max(10,((len(data)+columns-1)//columns)*step+3),'height':4.5},
       'instances':items,'assets':[],'bindings':{},'meta':{'editorVersion':'0.1.0','gameplayWrites':0,'officialScene':False,'ownerRenderApproved':True,'ownerPhysicalGlbPass':False,'created':'2026-11-18','metalFamily':key}}
    filename=ROOT/'projects'/f'{key}.json';filename.write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
    return filename
for code in ['m01','m02','m03']:
   group=[a for a in assets if a['finish']==code]
   project('trialum-s7-metal-'+code+'-20-glbs',f'{code.upper()} · 20 МЕТАЛНИ GLB · ПРЕГЛЕД',group,5,3.1)
project('trialum-s7-metal-all-60-glbs','M01 / M02 / M03 · СИТЕ 60 МЕТАЛНИ GLB',assets,6,3.3)
project('trialum-s7-metal-3-finishes-service-compare','M01–M03 · ИСТИ ФОРМИ, ТРИ МЕТАЛНИ МАТЕРИЈАЛИ',
 [a for kind in ['full','edge-north','corner-nw','service-vent','service-hatch','service-conduit','service-led-panel','service-drain'] for a in assets if a['variant']==kind],3,3.3)
