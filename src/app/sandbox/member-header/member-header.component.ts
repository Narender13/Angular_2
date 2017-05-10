
import { Component, ViewEncapsulation, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { WindowDefinitionService } from './../../common/window.definition/window.definition.service';
import { WindowDefinitionDto } from './../../common/window.definition/window.definition.dtos';
import { MemberHeaderService } from './member-header.service';
import { MemberDetailsDto } from './member-header.dtos';

@Component({
    selector: 'member-header',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['member-header.component.css'],
    templateUrl: './member-header.component.html',
    providers: [MemberHeaderService, WindowDefinitionService],
})
export class MemberHeaderComponent implements OnInit, OnDestroy {
    mode = 'Observable';
    isLoading: boolean = false;
    memberWindowDefinition = [];
    member: MemberDetailsDto = new MemberDetailsDto();

    @Input() set memberId(memberId: string) {
        if (memberId) {
            this.showMember(memberId);
        }
    }

    @Input() set memberPCP(pcp:string) {
        if (pcp)
        {
            this.member.pcp = pcp;
        }
    }



    @Output() memberFullNameEmitter: EventEmitter<string> = new EventEmitter<string>();

    constructor(private _memberBannerService: MemberHeaderService,
        private _windowDefinitionService: WindowDefinitionService) {
    }

    showMember(memberId) {

        this.member.memberId = memberId;

        this._memberBannerService.getMemberHeader(memberId).subscribe(
            member => {
                this.member = member;
                this.memberFullNameEmitter.emit(member.firstName + ' ' + member.lastName);
            },
            error => console.log('Error HTTP GET Service'),
            () => console.log('Member data', this.member));
    }

    getLabelName(label, labelKey, defaultName) {
        if (label != null && label[labelKey] !== '' && label.hasOwnProperty(labelKey)) {
            return label[labelKey];
        }
        return defaultName;
    }

    formatPhone(phone: string) {
        if (!phone) {
            return null;
        }
        if (phone.match(/[^0-9]/)) {
            return phone;
        }
        let value: string = phone.toString().trim().replace(/^\+/, '');
        let code: string, number: string;
        code = value.slice(0, 3);
        number = value.slice(3);
        number = number.slice(0, 3) + '-' + number.slice(3, 7) + ' ' + number.slice(7);
        return (' (' + code + ') ' + number).trim();
    }

    ngOnInit() {
        this._windowDefinitionService.getWindowDefinition('w_member').subscribe(
            memberWindowDefinition => { this.memberWindowDefinition = this.formatMemberLabel(memberWindowDefinition) },
            error => console.log('Error HTTP GET Service'),
            () => console.log('Member Label', this.memberWindowDefinition));

    }

    ngOnDestroy() {

    }

    private formatMemberLabel(labels) {
        let sortedLabelHash: any = {};

        for (let label in labels) {
            sortedLabelHash[labels[label].fieldId] = labels[label].fieldLabel;
        }

        return sortedLabelHash;
    }

    private setMemberPcp(pcp:string){
         this.member.pcp = pcp;
    }

}
