/* Ephemeral, room-scoped speech envelopes. No persistence or rewards. */
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PET=/^[A-Za-z0-9_-]{1,64}$/;
export function parsePetSpeech(message){
 if(!message||typeof message!=='object'||Array.isArray(message)||
  Object.keys(message).some(key=>!['type','roomId','petId','sessionId','turnId','text'].includes(key))||
  message.type!=='pet_speech'||!UUID.test(message.roomId||'')||
  !PET.test(message.petId||'')||!UUID.test(message.sessionId||'')||
  !UUID.test(message.turnId||'')||typeof message.text!=='string')throw Error('invalid_pet_speech');
 const text=message.text.trim();
 // No addresses, links, control chars, multiline content or long transcripts.
 // This is a first safety boundary, not a substitute for human content review.
 if(text.length<1||text.length>160||/[\u0000-\u001f\u007f]/.test(text)||
  /(?:https?:\/\/|www\.|\S+@\S+|\b\+?\d[\d ().-]{7,}\d\b)/i.test(text))throw Error('invalid_pet_speech');
 return {roomId:message.roomId,petId:message.petId,sessionId:message.sessionId,
  turnId:message.turnId,text};
}
