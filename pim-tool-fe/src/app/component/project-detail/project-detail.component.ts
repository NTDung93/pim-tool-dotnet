import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProjectService } from 'src/app/service/project.service';
import { Project } from 'src/app/model/project';
import { GroupService } from '../../service/group.service';
import { Group } from 'src/app/model/group';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/service/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { EmployeeService } from 'src/app/service/employee.service';
interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
})

export class ProjectDetailComponent {
  @ViewChild('alertPopup') alertPopup!: ElementRef;
  siteLanguage = 'English';
  languageList = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'French' },
  ];
  groups: Group[] | undefined;
  updateProject!: Project;
  actionTitle: any = 'projectDetail.create.title';
  btnSubmitContent: any = 'projectDetail.create.btnCreate';
  editMode: boolean = false;
  numberErr: string = '';
  ennDateErr: string = '';
  globalErr: string = 'projectDetail.globalError';
  projectSent!: Project;
  isFailed: boolean = false;
  selectedItems: any[] | undefined;
  items: any[] | undefined;

  constructor(
    private projectService: ProjectService,
    private groupService: GroupService,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    public sharedService: SharedService,
    private translate: TranslateService,
    private primengConfig: PrimeNGConfig
  ) { }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.getGroups();
    this.loadEmps();
    this.globalErr = 'projectDetail.globalError';
    const projectNumber: any =
      this.route.snapshot.paramMap.get('projectNumber');
    if (projectNumber) {
      this.editMode = !this.editMode;
      this.getProjectByNumber(projectNumber);
      this.actionTitle = 'projectDetail.update.title';
      this.btnSubmitContent = 'projectDetail.update.btnUpdate';
    }
  }
  
  filterMember(event: AutoCompleteCompleteEvent) {
    console.log(event.query);
    this.searchEmp(event.query);
  }

  searchEmp(name: string){
    this.employeeService.searchEmployees(name).subscribe(
      (response: any) => {
        console.log(response);
        this.items = response.map((emp: any) => emp.visa + ': ' + emp.firstName + ' ' + emp.lastName);
        console.log(this.items);
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  loadEmps() {
    this.employeeService.getEmployees().subscribe(
      (response: any) => {
        console.log(response);
        this.items = response.map((emp: any) => emp.visa + ': ' + emp.firstName + ' ' + emp.lastName);
        console.log(this.items);
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  changeSiteLanguage(localeCode: string): void {
    const selectedLanguage = this.languageList
      .find((language) => language.code === localeCode)
      ?.label.toString();
    if (selectedLanguage) {
      this.siteLanguage = selectedLanguage;
      this.translate.use(localeCode);
    }
    const currentLanguage = this.translate.currentLang;
    console.log('currentLanguage', currentLanguage);
  }

  public getProjectByNumber(projectNumber: string): void {
    this.projectService.getProjectByNumber(parseInt(projectNumber)).subscribe(
      (response: Project) => {
        this.updateProject = response;
        console.log('Current project: ', response);
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  public getGroups(): void {
    this.groupService.getGroups().subscribe(
      (response: Group[]) => {
        this.groups = response;
        console.log(this.groups);
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  public onAddProject(addForm: NgForm): void {
    console.log(addForm.value);

    if (addForm.invalid) {
      this.globalErr = 'projectDetail.globalError';
      this.numberErr = '';
      return;
    }

    const startTime = new Date(addForm.value.startDate);
    const currentTime = new Date();

    if (startTime < currentTime) {
      this.ennDateErr = 'projectDetail.startBeforeCurrent';
      return;
    }

    if (addForm.value.endDate != null) {
      const endTime = new Date(addForm.value.endDate);

      if (startTime >= endTime) {
        this.ennDateErr = 'projectDetail.startAfterEnd';
        return;
      }
    }

    this.projectService.addProject(addForm.value).subscribe(
      (response: Project) => {
        console.log(response);
        addForm.reset();
        this.router.navigateByUrl('/list');
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        if (error.error.includes('project number already existed')) {
          this.numberErr = 'projectDetail.numberExist';
        }
        this.isFailed = true;
        this.globalErr = 'projectDetail.createProjectFailed';
      }
    );
  }

  public onUpdateProject(addForm: NgForm): void {
    if (addForm.invalid) {
      this.globalErr = 'projectDetail.globalError';
      this.numberErr = '';
      return;
    }

    const startTime = new Date(addForm.value.startDate);
    if (addForm.value.endDate != null) {
      const endTime = new Date(addForm.value.endDate);

      if (startTime >= endTime) {
        this.ennDateErr = 'projectDetail.startAfterEnd';
        return;
      }
    }

    //set the version of current project for the project sent to BE, cuz form's values dont contain version
    this.projectSent = addForm.value;
    this.projectSent.version = this.updateProject.version;

    console.log('Updating values: ', this.projectSent);

    this.projectService.updateProject(this.projectSent).subscribe(
      (response: Project) => {
        console.log('Updated project: ', response);
        this.getGroups();
        this.router.navigateByUrl('/list');
        addForm.reset();
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this.isFailed = true;
        if (
          error.error.includes('The project has been updated by another user')
        ) {
          this.globalErr = 'projectDetail.concurrentUpdate';
        }
      }
    );
  }

  closeAlert() {
    this.alertPopup.nativeElement.style.display = 'none';
  }

  public navigateToList() {
    this.router.navigateByUrl('/list');
  }
}
