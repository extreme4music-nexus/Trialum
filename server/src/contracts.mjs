// TRIALUM 1.5.6 planned gameplay contract. Not active live gameplay.
export const VERSION = '1.5.6-b-beta';
export const SKILLS = Object.freeze(['wave', 'spin', 'leap', 'symbols', 'logic', 'dialogue']);
export const SOLO_GATE = Object.freeze({petLevel:15, researchLevel:4});
export const TOYS = Object.freeze([
  Object.freeze({id:'sandbox',petLevel:15,skill:'symbols',initial:true}),
  Object.freeze({id:'seesaw',petLevel:15,skill:'wave',initial:true}),
  Object.freeze({id:'slide',petLevel:20,skill:'leap',initial:false}),
  Object.freeze({id:'pool',petLevel:25,skill:'leap',initial:false}),
  Object.freeze({id:'obstacle',petLevel:35,skill:'logic',initial:false}),
  Object.freeze({id:'trampoline',petLevel:45,skill:'spin',initial:false})
]);
export function soloUnlocked(petLevel,researchLevel){
  return Number.isFinite(petLevel)&&Number.isFinite(researchLevel)&&petLevel>=SOLO_GATE.petLevel&&researchLevel>=SOLO_GATE.researchLevel;
}
export function toyAvailable(toyId, petLevel, researchLevel, unlockedToys=[], sharedMember=false){
  const toy=TOYS.find(t=>t.id===toyId);
  if(!toy)return false;
  if(sharedMember)return true; // Shared host controls actual unlocked set; server MUST check membership and constructed toys.
  return soloUnlocked(petLevel,researchLevel) && (toy.initial || (petLevel>=toy.petLevel && unlockedToys.includes(toy.id)));
}
export function validNickname(name){
  return typeof name==='string'&&name.trim().length>=1&&[...name.trim()].length<=32&&!/[\u0000-\u001f\u007f]/u.test(name);
}
export function validShortMessage(message){
  return typeof message==='string'&&[...message.trim()].length>=1&&[...message.trim()].length<=120&&!/[\u0000-\u001f\u007f]/u.test(message);
}
