
import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItem } from 'primeng/primeng';

@Component({
    selector: 'getNextContainerTester',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './getnext-container-tester.component.html',
    styleUrls: ['getnext-container-tester.component.css']
})

export class GetNextContainerTesterComponent {

    assessmentTypes: SelectItem[];
    types: SelectItem[];
    selectedAssessmentType;
    selectedType;

    constructor(private _route: ActivatedRoute, private _router: Router) {
        this.setAssessmentTypes();
        this.selectedAssessmentType = {type: 'CARETRACK', id: 'CARE_TRACK_Q'};

        this.setTypes();
        this.selectedType = 'ASSESSMENT';
    }

    startForType(getNextQueueItemId: string, userId: string, userToken: string,
        tenantId: string, memberId: string) {

        if (this.selectedType === 'ASSESSMENT') {
            this._router.navigate(['/getNextContainer/ASSESSMENT'], { queryParams: {
                getNextTaskId: getNextQueueItemId, userId: userId, userToken: userToken,
                tenantId: tenantId, memberId: memberId,
                assessmentAlgorithmId: this.selectedAssessmentType.id,
                assessmentType: this.selectedAssessmentType.type,
                assessmentAction: 'GETNEXT_START',
                status: 'ZINITIAL' }});
        } else if (this.selectedType === 'CAREPLAN') {
            this._router.navigate(['/getNextContainer/CAREPLAN'], { queryParams: {
                getNextTaskId: getNextQueueItemId, userId: userId, userToken: userToken,
                tenantId: tenantId, memberId: memberId, status: 'ZINITIAL' }});
        }
    }

    private setAssessmentTypes() {

        this.assessmentTypes = [];
        this.assessmentTypes.push({label: 'CARETRACK', value: {type: 'CARETRACK', id: 'CARE_TRACK_Q'}});
        this.assessmentTypes.push({label: 'GENERAL', value: {type: 'GENERAL', id: 'GENERAL_ASSESSMENT'}});
    }

    private setTypes() {

        this.types = [];
        this.types.push({label: 'ASSESSMENT', value: 'ASSESSMENT'});
        this.types.push({label: 'CAREPLAN', value: 'CAREPLAN'});
    }
}
