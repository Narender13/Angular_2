
import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'memberDemographicsTester',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './member-demographics-tester.component.html',
    styleUrls: ['member-demographics-tester.component.css']
})


export class MemberDemographicsTesterComponent {

    
    constructor(private _route: ActivatedRoute, private _router: Router) {
    }

    start(userId: string, userToken: string, tenantId: string, memberId: string ) {

       
            this._router.navigate(['/memberDemographics'], { queryParams: {
                 userId: userId, userToken: userToken,
                tenantId: tenantId, memberId: memberId
               }});
        
    }   
}
