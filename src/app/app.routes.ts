
import { Routes, RouterModule } from '@angular/router';
import { Home } from './home';
import { NoContent } from './no-content';

// Assessment components
import { ApAssessmentComponent } from './sandbox/ap-assessment/ap-assessment.component';
import { CarePlanComponent } from './sandbox/careplan/careplan.component';
import { GapStatementComponent } from './sandbox/ap-assessment/ap-gapstatement.component';

// Calendar components
import { AdminCalendarComponent } from './sandbox/calendar/admin/admin.calendar.component';
import { AssessmentCalendarComponent } from './sandbox/calendar/assessment/assessment.calendar.component';
import { GetNextCalendarComponent } from './sandbox/calendar/getnext/getnext.calendar.component';
import { MemberCalendarComponent } from './sandbox/calendar/member/member.calendar.component';
import { UserCalendarComponent } from './sandbox/calendar/user/user.calendar.component';

// Getnext components
import { GetNextComponent } from './sandbox/getnext/getnext.component';
import { GetNextContainerComponent } from './sandbox/getnext-container/getnext-container.component';
import { ChartNoteComponent } from './sandbox/getnext-container/chart-note/chart-note.component';
import { MemberHeaderComponent } from './sandbox/member-header/member-header.component';
import { GetNextContainerTesterComponent } from './sandbox/getnext-container-tester/getnext-container-tester.component';
import { MemberOtherContactComponent } from './sandbox/getnext-container/member-other-contact/member-other-contact.component';
import { MemberOtherContactTesterComponent } from './sandbox/getnext-container/member-other-contact/member-other-contact-tester/member-other-contact-tester.component';
import { MemberDemographicsComponent } from './sandbox/getnext-container/member-demographics/member-demographics.component';
import { MemberDemographicsTesterComponent } from './sandbox/getnext-container/member-demographics/member-demographics-tester/member-demographics-tester.component';
import { MemberCaregiverComponent } from './sandbox/getnext-container/member-caregiver/member-caregiver.component';
import { MemberPCPComponent } from './sandbox/getnext-container/member-pcp/member-pcp.component';

// Common components
import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },

  { path: 'apAssessment', component: ApAssessmentComponent },
  { path: 'apAssessment/:assessmentType', component: ApAssessmentComponent },
  { path: 'apCareplan', component: CarePlanComponent },
  { path: 'chartNote', component: ChartNoteComponent },
  { path: 'apCareplan/:careplan', component: CarePlanComponent },

  { path: 'calendarAdmin', component: AdminCalendarComponent },
  { path: 'calendarAssessment', component: AssessmentCalendarComponent },
  { path: 'calendarGetNext', component: GetNextCalendarComponent },
  { path: 'calendarMember', component: MemberCalendarComponent },
  { path: 'calendarUser', component: UserCalendarComponent },

  { path: 'getnext', component: GetNextComponent },
  { path: 'getnext/:id', component: GetNextComponent },

  { path: 'getNextContainer', component: GetNextContainerComponent },
  { path: 'getNextContainer/:type', component: GetNextContainerComponent },
  { path: 'getNextContainerTester', component: GetNextContainerTesterComponent },
  { path: 'memberHeader', component: MemberHeaderComponent },
  { path: 'memberOtherContact', component: MemberOtherContactComponent },
  { path: 'memberOtherContactTester', component: MemberOtherContactTesterComponent },
  { path: 'memberDemographics', component: MemberDemographicsComponent },
  { path: 'memberDemographicsTester', component: MemberDemographicsTesterComponent },
  { path: 'memberCaregiver', component: MemberCaregiverComponent },

  { path: 'gapStatementComponent', component: GapStatementComponent },
  { path: 'memberPCP', component: MemberPCPComponent },
  // { path: 'memberPCPTester', component: MemberPCPTesterComponent },
  { path: '**', component: NoContent },

];
