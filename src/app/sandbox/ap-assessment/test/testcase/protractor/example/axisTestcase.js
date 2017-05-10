describe('Axis App', function() {
    browser.driver.manage().window().maximize(); //To maximize the browser window run://
    var url = 'http://localhost.:3000/#/getNextContainer/apAssessment?assessmentAlgorithmId=CARE_TRACK_Q&launchContext=GET_NEXT&action=START&memberId=TM1234567890&tenantId=ABC123&assessmentType=caretrack&userToken=eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJjY21zZGJhIiwiaWF0IjoxNDg0NTE0NzA5LCJzdWIiOiJBUEggU3ViamVjdCIsImlzcyI6IkFQSCBJc3N1ZXIifQ.LWDFd6oTt7E8dykAr7QLYDT-n92mCTj2N1WxMWOXcLe2S_Xyl_0VjR6mk3hzWYUCeudTAfRb_viURY_CsBsprQ';

/*        browser.get(url);
        browser.waitForAngular();
        expect(browser.getCurrentUrl()).toContain(url);
    });*/

    var originalTimeout;

    beforeEach(function() {
       
         browser.driver.get(url);
   },200000);

    

    var previousButtonElement = element(by.buttonText('<< Previous'));
    var saveAndExitButtonElement = element(by.buttonText('Save and Exit'));
    var submitButtonElement = element(by.buttonText('Submit'));
    var nextButtonElement = element(by.buttonText('Next >>'));
    var radioButtonElement = element(by.css('[name="multiple_choice_single_select"]'));
    var checkBoxElement = element(by.css('[name="multiple_choice_multiple_select"]'));
    var textareaElement= element.all(by.css('textarea'));
    var checkVisibility = function(elememt) {
        for (i = 0; i < elememt.length; i++) {
            return expect(element[i].isDisplayed()).toBe(true);
        }

    }

  /*  it('Should have four buttons', function() {
        browser.get(url);
        browser.waitForAngular();
        checkVisibility(previousButtonElement);
        checkVisibility(saveAndExitButtonElement);
        checkVisibility(submitButtonElement);
        checkVisibility(nextButtonElement);
    });*/



    it('Should have  AP-Assissmen', function() {
        //browser.get(url);
    
       
            console.info('waiting for button');
            var EC = protractor.ExpectedConditions;
             var nextButtonVisibility;
           browser.wait(EC.visibilityOf(nextButtonElement), 10000);

               
         nextButtonElement.isDisplayed().then(function(isVisible) {
                 if(isVisible){
                     expect(textareaElement.last().isDisplayed()).toBe(true);
                     console.log(isVisible);
                 nextButtonVisibility = true; 
                 console.log(nextButtonVisibility);
                
          while(nextButtonVisibility) {
                     console.log(nextButtonVisibility);
                
               nextButtonVisibility =false;
               
             
             
             
             
             }

                 }

         });

               
    });




});