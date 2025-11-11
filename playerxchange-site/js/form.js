import {showToast} from './main.js';
const form=document.querySelector('[data-contact-form]');
if(form){const fields=Array.from(form.querySelectorAll('[data-field]'));const successBanner=document.querySelector('[data-form-success]');
const getField=name=>fields.find(field=>field.name===name);
const setError=(field,message)=>{const group=field.closest('.form-group');const error=group?.querySelector('[data-error]');if(message){field.setAttribute('aria-invalid','true');if(error){error.textContent=message;error.removeAttribute('hidden');}}else{field.removeAttribute('aria-invalid');if(error){error.textContent='';error.setAttribute('hidden','');}}};
fields.forEach(field=>field.addEventListener('input',()=>setError(field,'')));
form.addEventListener('submit',event=>{event.preventDefault();let hasError=false;const nameField=getField('name');const emailField=getField('email');const messageField=getField('message');if(nameField&&nameField.value.trim().length<2){setError(nameField,'Please share your full name.');hasError=true;}else if(nameField){setError(nameField,'');}
if(emailField){const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;if(!emailPattern.test(emailField.value.trim())){setError(emailField,'We need a valid email to follow up.');hasError=true;}else{setError(emailField,'');}}
if(messageField&&messageField.value.trim().length<20){setError(messageField,'Tell us a bit more so we can route your request.');hasError=true;}else if(messageField){setError(messageField,'');}
if(hasError)return;form.reset();if(successBanner){successBanner.classList.remove('hidden');successBanner.setAttribute('data-open','true');}showToast('Thanks! Our team will reach out within one business day.','success');});}
