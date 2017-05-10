import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { removeNgStyles, createNewHosts, createInputTransfer } from '@angularclass/hmr';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';

import { AppComponent } from './app.component';

/* PrimeNG Components */
import { InputTextModule, InputTextareaModule, DropdownModule, CalendarModule, PanelModule } from 'primeng/primeng';
import { TabViewModule, ButtonModule, RadioButtonModule, CheckboxModule } from 'primeng/primeng';
import { DataListModule, DataTableModule, DataGridModule, SharedModule } from 'primeng/primeng';
import { ScheduleModule, AccordionModule, AutoCompleteModule, BreadcrumbModule } from 'primeng/primeng';
import { ConfirmDialogModule, ContextMenuModule, DataScrollerModule, DialogModule } from 'primeng/primeng';
import { DragDropModule, FieldsetModule, FileUploadModule, GrowlModule } from 'primeng/primeng';
import { InputMaskModule, InputSwitchModule, ListboxModule, MegaMenuModule } from 'primeng/primeng';
import { MenuModule, MenubarModule, MessagesModule, MultiSelectModule } from 'primeng/primeng';
import { OrderListModule, OverlayPanelModule, PaginatorModule, PanelMenuModule } from 'primeng/primeng';
import { PasswordModule, PickListModule, SelectButtonModule, SlideMenuModule } from 'primeng/primeng';
import { SliderModule, SpinnerModule, SplitButtonModule, TabMenuModule } from 'primeng/primeng';
import { TieredMenuModule, ToggleButtonModule, ToolbarModule, TooltipModule } from 'primeng/primeng';
import { TreeModule, TreeTableModule, EditorModule } from 'primeng/primeng';


/* Material 2 components */
import { MdProgressBarModule } from '@angular2-material/progress-bar';

import { AppState, InteralStateType } from './app.service';
import { Home } from './home';
import { NoContent } from './no-content';

// Assessment components
import { ApAssessmentComponent } from './sandbox/ap-assessment/ap-assessment.component';
import { CarePlanComponent }    from './sandbox/careplan/careplan.component';
import { GapStatementComponent }  from './sandbox/ap-assessment/ap-gapstatement.component';

// Calendar components
import { AdminCalendarComponent } from './sandbox/calendar/admin/admin.calendar.component';
import { AssessmentCalendarComponent } from './sandbox/calendar/assessment/assessment.calendar.component';
import { GetNextCalendarComponent } from './sandbox/calendar/getnext/getnext.calendar.component';
import { MemberCalendarComponent } from './sandbox/calendar/member/member.calendar.component';
import { UserCalendarComponent } from './sandbox/calendar/user/user.calendar.component';

// Getnext components
import { GetNextComponent }             from './sandbox/getnext/getnext.component';
import { GetNextContainerComponent }    from './sandbox/getnext-container/getnext-container.component';
import { MemberHeaderComponent }        from './sandbox/member-header/member-header.component';
import { ChartNoteComponent }           from './sandbox/getnext-container/chart-note/chart-note.component';
import { GetNextContainerTesterComponent } from './sandbox/getnext-container-tester/getnext-container-tester.component';
import { MemberOtherContactComponent } from './sandbox/getnext-container/member-other-contact/member-other-contact.component';
import { CaregiverAddEditComponent } from './sandbox/getnext-container/member-caregiver/caregiver-add-edit/caregiver-add-edit.component';
import { ConfirmDialogComponent } from './sandbox/getnext-container/confirm-dialog/confirm-dialog.component';
import { MemberOtherContactTesterComponent }
    from './sandbox/getnext-container/member-other-contact/member-other-contact-tester/member-other-contact-tester.component';
import { MemberCaregiverComponent } from './sandbox/getnext-container/member-caregiver/member-caregiver.component';
import { MemberDemographicsComponent }  from './sandbox/getnext-container/member-demographics/member-demographics.component';
import { MemberDemographicsTesterComponent }
    from './sandbox/getnext-container/member-demographics/member-demographics-tester/member-demographics-tester.component';
import { MemberPCPComponent } from './sandbox/getnext-container/member-pcp/member-pcp.component';
// import { MemberPCPTesterComponent } from './sandbox/getnext-container/member-pcp/member-pcp-tester/member-pcp-tester.component';

// Common components / services
import { ConfigurationService } from './common/configuration.service';

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState, ConfigurationService
];

type StoreType = {
  state: InteralStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [AppComponent],

  declarations: [ // declare the components of the application
    AppComponent,
    Home,
    NoContent,
    ApAssessmentComponent,
    CarePlanComponent,
    MemberHeaderComponent,
    MemberDemographicsComponent,
    AdminCalendarComponent,
    AssessmentCalendarComponent,
    GetNextCalendarComponent,
    MemberCalendarComponent,
    UserCalendarComponent,
    GetNextComponent,
    GetNextContainerComponent,
    ChartNoteComponent,
    GetNextContainerTesterComponent,
    ConfirmDialogComponent,
    CaregiverAddEditComponent,
    MemberCaregiverComponent,
    MemberOtherContactComponent,
    MemberOtherContactTesterComponent,
    MemberDemographicsComponent,
    MemberDemographicsTesterComponent,
    GapStatementComponent,
    MemberPCPComponent
  ],

  imports: [ // import the modules, such as the Angular, Material, and PrimeNG modules
    BrowserModule, FormsModule, ReactiveFormsModule,  // begin angular modules

    // begin primeng modules 
    AccordionModule, AutoCompleteModule, BreadcrumbModule, ButtonModule, CalendarModule,
    CheckboxModule, SharedModule, ContextMenuModule, DataGridModule, DataListModule,
    DataScrollerModule, DataTableModule, DialogModule, ConfirmDialogModule, DragDropModule,
    DropdownModule, FieldsetModule, FileUploadModule, GrowlModule, InputMaskModule,
    InputSwitchModule, InputTextModule, InputTextareaModule, ListboxModule,
    MegaMenuModule, MenuModule, MenubarModule, MessagesModule, MultiSelectModule,
    OrderListModule, OverlayPanelModule, PaginatorModule, PanelModule, PanelMenuModule,
    PasswordModule, PickListModule, RadioButtonModule, ScheduleModule, SelectButtonModule,
    SlideMenuModule, SliderModule, SpinnerModule, SplitButtonModule, TabMenuModule,
    TabViewModule, TieredMenuModule, ToggleButtonModule, ToolbarModule, TooltipModule,
    TreeModule, TreeTableModule, EditorModule,
    // end primeng modules

    // begin material modules
    MdProgressBarModule,
    // end material modules

    HttpModule,  // resume more angular modules
    RouterModule.forRoot(ROUTES, { useHash: true })
  ],

  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})

export class AppModule {
  constructor(public appRef: ApplicationRef, public appState: AppState) { }

  hmrOnInit(store: StoreType) {
    if (!store || !store.state) return;
    console.log('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}

