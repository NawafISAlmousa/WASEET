document.addEventListener("DOMContentLoaded",function(){
    const itemPopUpShadow = document.getElementById("item-pop-up-shadow");
    const itemPopUp = document.getElementById("item-pop-up");
    const itemAddButton = document.getElementById("item-add-button")
    
    itemPopUpShadow.addEventListener("click",function(){
        itemPopUpShadow.style.display = 'none';
        itemPopUp.style.display = 'none'; 
    })
    
    
    itemAddButton.addEventListener("click", function(){
        itemPopUpShadow.style.display = 'block';
        itemPopUp.style.display = 'block'; 
    })
})