//Doi tuong validator
function Validator(options) {
    function getParent(element,selector) {
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    
    var seletorRules={
    

    };
    
    //Ham thi hien validate
    function validate(inputElement,rule){
        var parentElement = getParent(inputElement,options.formGroupSelector)
        var errorElement=parentElement.querySelector(options.errorSelector);
        var errorMessage ;


        //Lay ra cac rule cua selector
        var rules=seletorRules[rule.selector];

        //Lap qua tung rule va (check)
        //Neu co loi thi dung viec kiem tra
        for(var i=0;i<rules.length;++i){
            switch(inputElement.type){
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector+':checked'));

                break;
                default:
                    errorMessage = rules[i](inputElement.value);
                    
            }
            
            if(errorMessage) break;
        }


        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid');
        }else{
            errorElement.innerText = '';
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid');

        }

        return !errorMessage;
    }
    //Lay element cua form can validate

    var formElement = document.querySelector(options.form);
    
    if(formElement){

        //Khi submit form
        formElement.onsubmit= function(e){
            e.preventDefault();
            var isFormValid=true; 
            //Lap qua tung rule va validate
            options.rules.forEach(function(rule){
                var inputElement=formElement.querySelector(rule.selector);
                var isValid=validate(inputElement,rule);
                if(!isValid){
                    isFormValid=false;
                }
            });
            if(isFormValid){
                //Truong hio submit voi javasci
                if(typeof options.onSubmit == 'function'){
                   var enableInputs=formElement.querySelectorAll('[name]:not([disabled])');
                   var formValues=Array.from(enableInputs).reduce(function(values,input){
                    switch(input.type){
                        case'checkbox':
                        if(!input.matches(':checked')) {
                            values[input.name]='';
                            return values;
                        }
                        if(!Array.isArray(values[input.name])){
                            values[input.name]=[];
                        }
                        values[input.name].push(input.value);
                        break;
                        case'radio':
                        values[input.name]=formElement.querySelector(`[name="${input.name}"]:checked`).value;
                            break;
                        case'file':
                            values[input.name]=input.files;
                        break;
                        default:
                            values[input.name]=input.value;
                        }
                    return values;
                   },{});
                    options.onSubmit(formValues);
                }
            }
            else{
                // formElement.submit();
            }
        }
        //Lap qua moi rule va xu ly (lang nghe su kien )
        options.rules.forEach(function(rule){
            //Luu lai cac rule cho moi input
            if(Array.isArray(seletorRules[rule.selector])){
                seletorRules[rule.selector].push(rule.test);
            }else{
                seletorRules[rule.selector]=[rule.test];
            }

            var inputElements=formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement){
                inputElement.onblur = function(){
                    validate(inputElement,rule);
                }
                //Xy ly truong hop nhap inputElement
                inputElement.oninput = function(){
                    var errorElement=getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);

                    errorElement.innerText = '';
                    getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
                }

            });
                
            
        });
    }
}



//Dinh nghia cac rules

//Nguyen tac cua cac rules
//1.Khi co loi thi tra ra messsage loi
//2.Khi khong co loi thi khong tra ra cai gi ca
Validator.isRequired = function(selector,messsage){
    return{
        selector: selector,
        test: function(value){
            return value ? undefined : messsage||'Vui lòng nhập trường này'
        }
    };
}

Validator.isEmail = function(selector){
    return{
        selector: selector,
        test: function(value){
            var regex =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập đúng định dạng email';
        }
    };
}
Validator.isPassword = function(selector,min){
    return{
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} ký tự`;
        }
    };
}

Validator.isPasswordConfirmation = function(selector,getConfirmValue,messsage){
    return{
        selector: selector,
        test: function(value){
            return value===getConfirmValue() ? undefined :messsage|| 'Giá trị nhập lại không đúng';
        }
    }
}