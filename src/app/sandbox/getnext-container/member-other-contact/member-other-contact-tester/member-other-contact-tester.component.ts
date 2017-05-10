
import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'memberOtherContactTester',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './member-other-contact-tester.component.html',
    styleUrls: ['member-other-contact-tester.component.css']
})

export class MemberOtherContactTesterComponent {

    constructor(private _route: ActivatedRoute, private _router: Router) {
    }

    start(userId: string, userToken: string, tenantId: string, memberId: string, contactSeq: string ) {

       
            this._router.navigate(['/memberOtherContact'], { queryParams: {
                 userId: userId, userToken: userToken,
                tenantId: tenantId, memberId: memberId, memberOherContactSeq: contactSeq
               }});
        
    }   
}
