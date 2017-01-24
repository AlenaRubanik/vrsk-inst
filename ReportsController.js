// <copyright file="ReportsController.js" company="Verisk">
//   Copyright 2016
// </copyright>
// <summary>
// Reports Controller.
// </summary>
/// <param name="vmConfig">The vm configuration.</param>
/// <param name="LOBService">The lob service.</param>
/// <param name="JurisdictionService">The jurisdiction service.</param>
/// <param name="$filter">The $filter.</param>
/// <param name="$controller">The $controller.</param>
/// <param name="$scope">The $scope.</param>
/// <param name="$http">The $HTTP.</param>
/// <param name="roleAccessService">The role access service.</param>
/// <param name="SiteCatalystService">The site catalyst service.</param>
/// <param name="TagService">The tag service.</param>
/// <param name="TemisService">The temis service.</param>
app.controller('ReportsController', ['vmConfig', 'LOBService', 'JurisdictionService', '$filter', 'filterFilter', '$controller', '$scope', '$http', 'roleAccessService', 'SiteCatalystService', 'TagService', 'temisService', 'alertCountFactoryData', 'SearchTypeService', 'GeneralInfoService',
    function (vmConfig, LOBService, JurisdictionService, $filter, filterFilter, $controller, $scope, $http, roleAccessService, SiteCatalystService, TagService, TemisService, AlertCountFactoryData, SearchTypeService, GeneralInfoService) {
        // Extending the reports controller to use the scope of lob controller.
        angular.extend(this, $controller('lobController', { $scope: $scope }));
        var reports_combo_box = {}, lobs_combo = {}, formNumberCombobox = {}, adminNonAdmin_combo = {}, tags_combo = {},
            states_combo = {}, library_combo = {}, _this = this,
            urlPrefix = '/Content/templates/Reports/';
        this.languageStrings = vmConfig.languageStrings;
        this.dateFormat = vmConfig.dateFormat;
        this.disableRun = false;
        var entitledLibraries = [];
        AlertCountFactoryData.disableAlerts = false;
        SearchTypeService.setType('form');
        $scope.isISOTenant = false;
        LOBService.resetLobsList();

        /// <summary>
        /// is User ISO Tenant.
        /// </summary>
        /// <param name="isISOTenant">The is iso tenant.</param>
        roleAccessService.isUserISOTenant(function (isISOTenant) {
            $scope.isISOTenant = isISOTenant;
        });
        // The LOBs object
        this.lobs = {
            selectedLobs: [],
            data: {},
            combo_box: {},
            settings: {
                'maxHeight': '200px',
                'showTitle': false,
                'editable': true,
                'placeholderText': _this.languageStrings.lbl_Select,
                'propertyName': 'LobValue',
                'typeahead': true
            }
        };
        this.reportRunDate = $filter('date')(new Date(), 'MM/dd/yyyy hh:mm:ss a');
        this.lobs.combo_box = lobs_combo;

        /// <summary>
        /// get Lob List.
        /// </summary>
        /// <param name="lobs">The lobs.</param>
        LOBService.getLobList(function (lobs) {
            _this.lobs.data = lobs;
            _this.lobs.data = $filter('orderBy')(lobs, 'LobValue');
        });

        // The Jurisdictions object
        this.states = {
            selectedStates: [],
            data: {},
            combo_box: {},
            settings: {
                'showTitle': true,
                'editable': true,
                'placeholderText': _this.languageStrings.lbl_Select,
                'propertyName': 'StateCode',
                'titleName': 'StateName',
                'typeahead': true
            }
        };
        JurisdictionService.getJurisdictionList(function (data) {
            /// <summary>
            /// get Jurisdiction List.
            /// </summary>
            /// <param name="data">The data.</param>
            _this.states.data = data;
        });
        this.states.combo_box = states_combo;

        // The libraries dropdown object
        this.library = {
            data: [
                {
                    'id': 'all',
                    'Abbreviation': 'All'
                },
                {
                    'id': 'iso',
                    'Abbreviation': 'ISO'
                },
                {
                    'id': 'proprietary',
                    'Abbreviation': 'Proprietary'
                }
            ],
            combo_box: {},
            settings: {
                'maxHeight': '200px',
                'showTitle': false,
                'editable': false,
                'placeholderText': _this.languageStrings.lbl_Select,
                'propertyName': 'Abbreviation'
            }
        };

        this.library.combo_box = library_combo;
        this.admittedNonAdmitted = {
            data: [
                   {
                       'id': 'Yes', 'name': 'Admitted Only'
                   },
                       { 'id': 'No', 'name': 'Non-Admitted Only' },
                   {
                       'id': 'NA', 'name': 'Both'
                   }],
            combo_box: {},
            settings: {
                'maxHeight': '200px',
                'showTitle': false,
                'editable': false,
                'placeholderText': _this.languageStrings.lbl_Select,
                'propertyName': 'name'
            }
        };
        this.admittedNonAdmitted.combo_box = adminNonAdmin_combo;

        /// <summary>
        /// set Admitted Non Admitted.
        /// </summary>
        /// <param name="item">The item.</param>
        this.setAdmittedNonAdmitted = function (item) {
            this.admitted = item.id;
            this.AdmtNAdmtInvalid = false;
        };
        this.asOfDateDatePicker = {
            opened: false,
            calenderPopup: function () {
                /// <summary>
                /// calender Popup instance.
                /// </summary>
                _this.asOfDateDatePicker.opened = true;
            }
        };
        this.dateOptions = {};
        this.tags = {
            selectedTags: [],
            data: [],
            combo_box: {},
            settings: {
                'editable': true,
                'placeholderText': _this.languageStrings.lbl_Select,
                'propertyName': 'TagName',
                'typeahead': true
            }
        };
        this.tags.combo_box = tags_combo;
        this.reports_combo_box = reports_combo_box;
        this.reportListSettings = {
            'showTitle': false,
            'editable': false,
            'placeholderText': this.languageStrings.lbl_SELECT_REPORT,
            'propertyName': 'ReportName',
            'typeahead': false
        };

        // The reports data list array with Urls to laod the respective template on selection
        this.reportListData = [
            {
                id: 'FSLB',
                ReportName: this.languageStrings.lbl_FSLB,
                url: urlPrefix + 'reports-para-FSLB.html'
            },
            {
                id: 'FLB',
                ReportName: this.languageStrings.lbl_FLB,
                url: urlPrefix + 'reports-para-FLB.html'
            },
            {
                id: 'AIAF',
                ReportName: this.languageStrings.lbl_AIAF,
                url: urlPrefix + 'reports-para-AIAF.html'
            },
            {
                id: 'SSFSLI',
                ReportName: this.languageStrings.lbl_SSFSLI,
                url: urlPrefix + 'reports-para-SSFSLI.html'
            },
            {
                id: 'MFLBS',
                ReportName: this.languageStrings.lbl_MFLBS,
                url: urlPrefix + 'reports-para-MFLBS.html'
            },
            {
                id: 'OFLBS',
                ReportName: this.languageStrings.lbl_OFLBS,
                url: urlPrefix + 'reports-para-OFLBS.html'
            },
            {
                id: 'ANF',
                ReportName: this.languageStrings.lbl_ANF,
                url: urlPrefix + 'reports-para-ANF.html'
            },
            {
                id: 'TRLB',
                ReportName: this.languageStrings.lbl_TRLB,
                url: urlPrefix + 'reports-para-TRLB.html'
            },
            {
                id: 'FAPDR',
                ReportName: this.languageStrings.lbl_FAPDR,
                url: urlPrefix + 'reports-para-FAPDR.html'
            },
            {
                id: 'PFUDR',
                ReportName: this.languageStrings.lbl_PFUDR,
                url: urlPrefix + 'reports-para-PFUDR.html'
            }
        ];

        this.isIsoTenant = false;
        roleAccessService.isUserISOTenant(function (isIsoTenant) {
            /// <summary>
            /// User iso tenant.
            /// </summary>
            /// <param name="isIsoTenant">The is iso tenant.</param>
            if (isIsoTenant) {
                _this.reportListData = _.without(_this.reportListData, _.findWhere(_this.reportListData, { id: "FAPDR" }), _.findWhere(_this.reportListData, { id: "PFUDR" }));
            }
        });

        this.selectedReport = null;
        this.onReportItemSelect = function (item) {
            /// <summary>
            /// onReport Item Select.
            /// </summary>
            /// <param name="item">The item.</param>
            if (_this.selectedReport && _this.selectedReport.id === item.id) {
                // Selection is not changed in this case. So, returnting
                return;
            }
            if (item.name !== '') {
                // Setting all the options to default values
                _this.selectedReport = item;
                _this.lobs.selectedLobs = [];
                _this.states.selectedStates = [];
                _this.asOfDate = new Date();
                _this.selectedLibrary = null;
                _this.dateInvalid = false;
                _this.lobInvalid = false;
                _this.jurisdictionInvalid = false;
                _this.libraryInvalid = false;
                _this.AdmtNAdmtInvalid = false;
                _this.selectedAdmtNAdmt = null;
                _this.formNumber = '';
                _this.formNumberInvalid = false;
                _this.tagsInvalid = false;
                _this.formType = { mandatory: false, multistate: false, nonadmitted: false };
            } else {
                this.selectedReport = null;
            }
            if (this.selectedReport.id === 'FAPDR' || this.selectedReport.id === 'PFUDR') {
                // Handling forms approved for production by date range
                // and forms uploaded by date range
                _this.dateOptions = {};
                this.fromDateInvalid = false;
                this.toDateInvalid = false;
                _this.fromDate = null;
                _this.toDate = null;
                _this.fromDateInvalid = false;
                _this.toDateInvalid = false;

                // AJAX call to get the library abbreviations
                var libraryPromise = GeneralInfoService.getLibraries();
                libraryPromise.then(function (responseData) {
                    /// <summary>
                    /// the specified response data.
                    /// </summary>
                    /// <param name="responseData">The response data.</param>
                    var otherCompaniesList = _.without(_this.library.data, _.findWhere(_this.library.data, { id: "proprietary" }), _.findWhere(_this.library.data, { id: "iso" }));
                    entitledLibraries = $filter('orderBy')(responseData.libraryData, 'Abbreviation');
                });
                _this.library.data = [{
                    'id': 'proprietary',
                    'Abbreviation': 'Proprietary'
                }];

                // AJAX call to get all the custom LOBs
                var promise = GeneralInfoService.getAllCustomLobs();
                promise.then(function (responseData) {
                    /// <summary>
                    /// s the specified response data.
                    /// </summary>
                    /// <param name="responseData">The response data.</param>
                    _this.lobs.data = $filter('orderBy')(responseData.data.Results, 'LobValue');
                });
            }
            else if (item.id === 'ANF') {
                LOBService.getLobList(function (lobs) {
                    _this.lobs.data = $filter('orderBy')(lobs, 'LobValue');
                });
                _this.library.data = [{
                    'id': 'proprietary',
                    'Abbreviation': 'Proprietary'
                }];
            }
            else {
                LOBService.getLobList(function (lobs) {
                    /// <summary>
                    /// get Lob List specified lobs.
                    /// </summary>
                    /// <param name="lobs">The lobs.</param>
                    _this.lobs.data = $filter('orderBy')(lobs, 'LobValue');
                });
                this.library.data = [{
                    'id': 'all',
                    'Abbreviation': 'All'
                }, {
                    'id': 'iso',
                    'Abbreviation': 'ISO'
                }, {
                    'id': 'proprietary',
                    'Abbreviation': 'Proprietary'
                }];
                if (item.id === 'TRLB') {
                    // For forms with selected Tag(s) by Line of Business report
                    _this.getTotalTags();
                }
            }
        };
        this.setAsOfDate = function () {
            /// <summary>
            /// set As Of Date instance.
            /// </summary>
            this.dateInvalid = false;
        };
        this.setFromDate = function () {
            /// <summary>
            /// set From Date instance.
            /// </summary>
            this.fromDateInvalid = false;
            this.dateOptions.minDate = this.fromDate;
            if (this.fromDate > this.toDate) {
                this.toDate = null;
            }
        };
        this.setToDate = function () {
            /// <summary>
            /// set To Date instance.
            /// </summary>
            this.toDateInvalid = false;
        };
        // Lob Item select event handler

        /// <summary>
        /// onLob Item Select.
        /// </summary>
        /// <param name="item">The item.</param>
        this.onLobItemSelect = function (item) {
            var noOfLOBsSelected = '';
            if (item.name !== '') {
                this.lobs.selectedLobs = [];
                this.lobs.selectedLobs.push(item);
                this.lobInvalid = false;
                if (this.lobs.selectedLobs.length > 0) {
                    noOfLOBsSelected = this.lobs.selectedLobs.length + " " + _this.languageStrings.lbl_LobSelected;
                } else {
                    noOfLOBsSelected = '';
                }
            } else {
                this.lobs.selectedLobs = [];
                noOfLOBsSelected = '';
            }
            if (lobs_combo.updateText) {
                lobs_combo.updateText(noOfLOBsSelected);
            }
        };
        // Jurisdiction Item select event handler


        /// <summary>
        /// onState Item Select.
        /// </summary>
        /// <param name="item">The item.</param>
        this.onStateItemSelect = function (item) {
            this.states.selectedStates = [];
            this.states.selectedStates.push(item);
            this.jurisdictionInvalid = false;
        };

        /// <summary>
        /// set Admitted Non Admitted.
        /// </summary>
        /// <param name="item">The item.</param>
        this.setAdmittedNonAdmitted = function (item) {
            this.selectedAdmtNAdmt = item.id;
            this.AdmtNAdmtInvalid = false;
        };
        // Library Item select event handler

        /// <summary>
        /// onLibrary Item Select.
        /// </summary>
        /// <param name="item">The item.</param>
        this.onLibraryItemSelect = function (item) {
            this.selectedLibrary = item.Abbreviation;
            this.libraryInvalid = false;
        };
        // tags Item select event handler

        /// <summary>
        /// onTag Item Select.
        /// </summary>
        /// <param name="item">The item.</param>
        this.onTagItemSelect = function (item) {
            if (item.name !== '') {
                var isTagAlreadySelected = TagService.isTagAlreadyPresent(_this.tags.selectedTags, item);
                if (!isTagAlreadySelected.tagAlreadyPresent) {
                    _this.tags.selectedTags.push(item);
                }
                _this.tagsInvalid = false;
                tags_combo.updateText('');
                _this.getTags();
                $('#tagsCombo').removeClass('open');
            }
        };

        /// <summary>
        /// get Tags specified key.
        /// </summary>
        /// <param name="key">The key.</param>
        this.getTags = function (key) {
            var tagsAll = this.temisFactory.totalTags;
            if (key !== '') {
                if (this.temisFactory.isAllTagsFetched) {
                    this.tags.data = filterFilter(tagsAll, {
                        TagName: key
                    }, function (actual, expected) {
                        /// <summary>
                        /// the specified actual.
                        /// </summary>
                        /// <param name="actual">The actual.</param>
                        /// <param name="expected">The expected.</param>

                        return actual && actual.toLowerCase().indexOf(expected.toLowerCase()) === 0;
                    });
                }
            }
            else {
                this.tags.data = tagsAll;
            }
            return this.tags.data;
        }

        // Remove tag item method

        /// <summary>
        /// remove Tag Item.
        /// </summary>
        /// <param name="item">The item.</param>
        this.removeTagItem = function (item) {
            _this.tags.selectedTags.splice(_this.tags.selectedTags.indexOf(item), 1);
        };
        this.formType = {};
        this.actionMenu = {
            items: [
                {
                    'name': this.languageStrings.lbl_ExportToExcel,
                    'code': 'excel'
                },
                {
                    'name': this.languageStrings.lbl_ExportToPDF,
                    'code': 'pdf'
                }
            ],
            actionProperty: 'name',
            btnText: this.languageStrings.lbl_Actions
        };
        roleAccessService.getAllModules(function (accessModulesData) {
            // Show exports results only if the user has access to export
            /// <summary>
            /// the specified access modules data.
            /// </summary>
            /// <param name="accessModulesData">The access modules data.</param>
            var exportAccessModule = _.findWhere(accessModulesData, { 'Module': 'ExportReportResults', Function: 'Export' });
            if (exportAccessModule) {
                _this.showExportResults = true;
            }
        });
        // Applying the table sorter to sort the tables in the report results page
        $('table').tablesorter();
        this.formNumber_combo_box = formNumberCombobox;
        this.formNumberSettings = {
            'showTitle': false,
            'editable': true,
            'placeholderText': this.languageStrings.lbl_SELECT,
            'propertyName': 'FormNumber',
            'typeahead': true
        };

        // Event handler on type-ahead of the form number in All Information About a Form report
        this.getFormNumberAutoCompleteData = function (key) {
            /// <summary>
            /// get Form Number AutoComplet eData.
            /// </summary>
            /// <param name="key">The key.</param>
            this.formNumber = key;
            this.formNumberInvalid = false;
            _this.formAutoSearchData = [];
            var data = {
                SearchText: key,
                CustomerId: localStorage.getItem('CustomerId')
            };
            $http({
                method: 'POST',
                url: Get_FormNumberAutoSuggestion,
                headers: { 'Content-Type': 'application/json' },
                data: data,
                cache: false
            }).then(function (responseData) {
                /// <summary>
                /// the specified response data.
                /// </summary>
                /// <param name="responseData">The response data.</param>
                _this.formAutoSearchData = [];

                /// <summary>
                /// the specified item.
                /// </summary>
                /// <param name="item">The item.</param>
                angular.forEach(angular.fromJson(responseData.data.data), function (item) {
                    _this.formAutoSearchData.push({ FormNumber: item });
                });
            });
        };

        /// <summary>
        /// onForm Number Select.
        /// </summary>
        /// <param name="item">The item.</param>
        this.onFormNumberSelect = function (item) {
            this.formNumber = item.FormNumber;
            this.formNumberInvalid = false;
        };

        /// <summary>
        /// submit Form instance.
        /// </summary>
        this.submitForm = function ($form) {
            var searchModel = {}, lobIdArray = [], jurisdictionArray = [], tagsArray = [], formattedDate, formattedToDate, formattedFromDate;

            /// <summary>
            /// selected Lobs specified.
            /// </summary>
            /// <param name="lob">The lob.</param>
            angular.forEach(this.lobs.selectedLobs, function (lob) {
                if (lob.name !== '') {
                    lobIdArray.push(lob.LobId);
                }
            });

            /// <summary>
            /// selected States.
            /// </summary>
            /// <param name="state">The state.</param>
            angular.forEach(this.states.selectedStates, function (state) {
                if (state.name !== '') {
                    jurisdictionArray.push(state.StateCode);
                }
            });

            /// <summary>
            /// selected Tags.
            /// </summary>
            /// <param name="tag">The tag.</param>
            angular.forEach(this.tags.selectedTags, function (tag) {
                if (tag.name !== '') {
                    tagsArray.push(tag.TagName);
                }
            });
            $form.action = '/Reports/ReportsForLOBsStates';
            formattedDate = $filter('date')(this.asOfDate, this.dateFormat);
            searchModel.asOfDate = formattedDate || '';
            formattedFromDate = $filter('date')(this.fromDate, this.dateFormat);
            searchModel.fromDate = formattedFromDate || '';
            formattedToDate = $filter('date')(this.toDate, this.dateFormat);
            searchModel.toDate = formattedToDate || '';
            searchModel.lob = lobIdArray;
            searchModel.state = jurisdictionArray.toString();
            searchModel.tag = tagsArray.toString();
            searchModel.library = this.selectedLibrary || '';
            searchModel.mandatory = this.formType.mandatory || false;
            searchModel.multistate = this.formType.multistate || false;
            searchModel.nonadmitted = this.formType.nonadmitted || false;
            this.lobInvalid = lobIdArray.length === 0;
            this.jurisdictionInvalid = jurisdictionArray.length === 0;
            this.AdmtNAdmtInvalid = !this.selectedAdmtNAdmt;
            this.libraryInvalid = !this.selectedLibrary;
            this.tagsInvalid = false;
            this.dateInvalid = !this.asOfDate;
            if (this.formNumber === undefined || this.formNumber === "" || this.formNumber.length === 0) {
                this.formNumberInvalid = true;
            } else {
                this.formNumberInvalid = false;
            }
            if (this.selectedReport.id === 'FLB') {
                this.formNumberInvalid = false;
                this.jurisdictionInvalid = false;
                this.AdmtNAdmtInvalid = false;
                this.fromDateInvalid = false;
                this.toDateInvalid = false;
                $form.action = '/Reports/ReportsForLOBs';
            }
            if (this.selectedReport.id === 'AIAF') {
                this.jurisdictionInvalid = false;
                this.libraryInvalid = false;
                this.AdmtNAdmtInvalid = false;
                this.dateInvalid = false;
                this.lobInvalid = false;
                this.fromDateInvalid = false;
                this.toDateInvalid = false;
                $form.action = '/Reports/ReportAllAboutForm';
            }
            if (this.selectedReport.id === 'MFLBS') {
                this.formNumberInvalid = false;
                this.AdmtNAdmtInvalid = false;
                this.jurisdictionInvalid = false;
                this.fromDateInvalid = false;
                this.toDateInvalid = false;
                $form.action = '/Reports/ReportsMandatoryFormsForLOBByState';
            }
            if (this.selectedReport.id === 'FSLB') {
                this.formNumberInvalid = false;
                this.AdmtNAdmtInvalid = false;
                this.fromDateInvalid = false;
                this.toDateInvalid = false;
            }
            if (this.selectedReport.id === 'MFLBS') {
                this.formNumberInvalid = false;
                this.AdmtNAdmtInvalid = false;
                this.jurisdictionInvalid = false;
                this.fromDateInvalid = false;
                this.toDateInvalid = false;
                $form.action = '/Reports/ReportsMandatoryFormsForLOBByState';
            }
            if (this.selectedReport.id === 'OFLBS') {
                this.formNumberInvalid = false;
                this.AdmtNAdmtInvalid = false;
                this.jurisdictionInvalid = false;
                this.fromDateInvalid = false;
                this.toDateInvalid = false;
                $form.action = '/Reports/ReportsForOptionalLOBsByState';
            }
            if (this.selectedReport.id === 'ANF') {
                this.jurisdictionInvalid = false;
                this.nonAdmitted = false;
                this.admittedNadmitted = this.admitted;
                this.formNumberInvalid = false;
                this.fromDateInvalid = false;
                this.toDateInvalid = false;
                $form.action = '/Reports/ReportsForAdmittedNonadmittedForms';
            }
            if (this.selectedReport.id === 'SSFSLI') {
                this.formNumberInvalid = false;
                this.AdmtNAdmtInvalid = false;
                this.fromDateInvalid = false;
                this.toDateInvalid = false;
                $form.action = '/Reports/ReportsForStateSpecificLOBsStates';
            }
            if (this.selectedReport.id === 'FAPDR' || this.selectedReport.id === 'PFUDR') {
                this.formNumberInvalid = false;
                this.AdmtNAdmtInvalid = false;
                this.jurisdictionInvalid = false;
                this.fromDateInvalid = !this.fromDate;
                this.toDateInvalid = !this.toDate;
                if (searchModel.library === "Proprietary") {
                    var LibraryAbbreviationArray = [], temp = [];
                    angular.forEach(entitledLibraries, function (entitledLibraryItem) {
                        if (entitledLibraryItem.Abbreviation !== '') {
                            temp.push(entitledLibraryItem.Abbreviation);
                        }
                    });
                    LibraryAbbreviationArray = _.reject(temp, function (obj) {
                        return obj === "Proprietary";
                    });
                    searchModel.library = LibraryAbbreviationArray;
                }
                if (this.selectedReport.id === 'FAPDR') {
                    $form.action = '/Reports/ApproveForProductionReportsByDateRange';
                } else {
                    $form.action = '/Reports/ProductionReportsByDateRange';
                }
            }
            if (this.selectedReport.id === 'TRLB') {
                this.tagsInvalid = tagsArray.length === 0;
                this.formNumberInvalid = false;
                this.AdmtNAdmtInvalid = false;
                this.jurisdictionInvalid = false;
                this.fromDateInvalid = false;
                this.toDateInvalid = false;
                $form.action = '/Reports/ReportsForTagsByLOBs';
            }
            if (!this.lobInvalid && !this.jurisdictionInvalid && !this.libraryInvalid && !this.dateInvalid && !this.formNumberInvalid && !this.tagsInvalid && !this.fromDateInvalid && !this.toDateInvalid && !this.AdmtNAdmtInvalid) {  
                $form.LobId = lobIdArray[0];
                $form.formLibrary = searchModel.library;
                $form.effectiveDate = formattedDate;
                $form.fromDate = searchModel.fromDate;
                $form.toDate = searchModel.toDate;
                $form.jurisdictions = jurisdictionArray.toString();
                $form.tags = tagsArray.toString();
                $form.mandatory = searchModel.mandatory;
                $form.multiState = searchModel.multistate;
                $form.nonAdmitted = searchModel.nonadmitted;
                $form.customerId = localStorage.getItem('CustomerId');
                $form.formNumber = this.formNumber;
                $form.admittedNadmitted = this.selectedAdmtNAdmt;
                $form.selectedReport = this.selectedReport.id;

                SiteCatalystService.trackSatelliteReportsRun(_this.selectedReport.ReportName);
                /*localStorage.setItem('searchModel', JSON.stringify(searchModel));
                localStorage.setItem('formattedDate', formattedDate);
                localStorage.setItem('selectedReport', this.selectedReport.id);
                localStorage.setItem('lobIdArray', lobIdArray);
                localStorage.setItem('jurisdictionArray', jurisdictionArray.toString());
                localStorage.setItem('tagsArray', tagsArray.toString());
                localStorage.setItem('customerId', localStorage.getItem('CustomerId'));
                localStorage.setItem('formNumber', this.formNumber);
                localStorage.setItem('action', document.reportsForm.action);
                localStorage.setItem('admittedNadmitted', this.selectedAdmtNAdmt);
                localStorage.setItem('fromDate', searchModel.fromDate);
                localStorage.setItem('toDate', searchModel.toDate);*/
                $form.timeDiff = new Date().getTimezoneOffset();
                //this.$apply();
                $form.submit();
            }
        };

        /// <summary>
        /// openLob Lookup Window instance.
        /// </summary>
        this.openLobLookupWindow = function () {
            if (arguments.length > 0) {
                LOBService.setLOBServiceFlag = true;
            }
            LOBService.openLobLookupWindow(
                this.lobs.data,
                this.lobs.selectedLobs,
                function (selectedLobs) {
                    /// <summary>
                    /// the specified selected lobs.
                    /// </summary>
                    /// <param name="selectedLobs">The selected lobs.</param>
                    _this.lobs.selectedLobs = selectedLobs;
                    var textToShow = '';
                    if (selectedLobs.length > 0 && selectedLobs[0].name !== '') {
                        textToShow = selectedLobs.length + " " + _this.languageStrings.lbl_LobSelected;
                        _this.lobInvalid = false;
                    }
                    else {
                        textToShow = '';
                        _this.lobInvalid = true;
                    }
                    _this.lobs.combo_box.updateText(textToShow);
                }
            );
        };

        /// <summary>
        /// open Jurisdiction Lookup Window instance.
        /// </summary>
        /// <returns></returns>
        this.openJurisdictionLookupWindow = function () {

            // <summary>
            /// the specified selected jurisdictions.
            /// </summary>
            /// <param name="selectedJurisdictions">The selected jurisdictions.</param>
            JurisdictionService.openJurisdictionLookupWindow(this.states.selectedStates, function (selectedJurisdictions) {
                _this.states.selectedStates = selectedJurisdictions;
                var textToShow = '';
                if (selectedJurisdictions.length > 0) {
                    textToShow = selectedJurisdictions.length + " " + _this.languageStrings.lbl_JurisdictionSelected;
                    _this.jurisdictionInvalid = false;
                }
                else {
                    textToShow = '';
                    _this.jurisdictionInvalid = true;
                }
                _this.states.combo_box.updateText(textToShow);
            });
        };
        this.temisFactory = TemisService;

        //Get Tags Data based on type and ISO-UserRole
        $scope.setRoleBasedTags = function (totalTags) {
            if ($scope.isISOTenant) {
                _this.tags.data = TagService.separateTemisTagsFromCustomTags(totalTags).temisTags;
            }
            else {
                _this.tags.data = _this.temisFactory.totalTags;
            }
        };
        /// <summary>
        /// get Total Tags instance.
        /// </summary>
        /// <returns></returns>
        this.getTotalTags = function () {

            /// <summary>
            /// getAll Tags instance.
            /// </summary>
            /// <returns></returns>
            TemisService.getAllTags(function () {
                $scope.setRoleBasedTags(_this.temisFactory.totalTags);
            })
        };

        /// <summary>
        /// open Tags Lookup Window instance.
        /// </summary>
        this.openTagsLookupWindow = function () {
            $scope.setRoleBasedTags(_this.temisFactory.totalTags);
            /// <summary>
            /// the specified selected tags.
            /// </summary>
            /// <param name="selectedTags">The selected tags.</param>
            TagService.openTagsLookupWindow(_this.tags.data,
                _this.tags.selectedTags,
                function (selectedTags) {
                    /// <summary>
                    /// the specified selected tags.
                    /// </summary>
                    /// <param name="selectedTags">The selected tags.</param>
                    if ($scope.isISOTenant) {
                        _this.tags.selectedTags = TagService.separateTemisTagsFromCustomTags(selectedTags).temisTags;
                    }
                    else {
                        _this.tags.selectedTags = selectedTags;
                    }
                    //_this.tags.selectedTags = selectedTags;
                    _this.tagsInvalid = false;
                }
            );
        };

        /// <summary>
        /// perform Action On Report.
        /// </summary>
        /// <param name="item">The item.</param>
        this.performActionOnReport = function (item) {
            var self = this;
            if (item.code === 'excel') {
                SiteCatalystService.trackSatelliteReportsExported(self.selectedReport.ReportName);
                commonDownloadFormStatesLOBs("XLS");
            } else if (item.code === 'pdf') {
                SiteCatalystService.trackSatelliteReportsExported(self.selectedReport.ReportName);
                commonDownloadFormStatesLOBs("PDF");
            } else {
                SiteCatalystService.trackSatelliteReportsPrinted(self.selectedReport.ReportName);
                printPage();
            }
        };


        /// <summary>
        /// Commons the download form states lo bs.
        /// </summary>
        /// <param name="printFormat">The print format.</param>
        function commonDownloadFormStatesLOBs(printFormat) {
            var searchModel = JSON.parse(localStorage.getItem('searchModel'));
            var formattedDate = localStorage.getItem('formattedDate');
            var lobIdArray = localStorage.getItem('lobIdArray');
            var jurisdictionArray = localStorage.getItem('jurisdictionArray');
            var formNumber = localStorage.getItem('formNumber');
            var action = localStorage.getItem('action');
            var admittedNadmitted = localStorage.getItem('admittedNadmitted');
            var tagsArray = localStorage.getItem('tagsArray');
            document.reportsForm.LobId.value = lobIdArray;
            document.reportsForm.formLibrary.value = searchModel.library;
            document.reportsForm.effectiveDate.value = formattedDate;
            document.reportsForm.jurisdictions.value = jurisdictionArray;
            document.reportsForm.tags.value = tagsArray;
            document.reportsForm.mandatory.value = searchModel.mandatory;
            document.reportsForm.multiState.value = searchModel.multistate;
            document.reportsForm.nonAdmitted.value = searchModel.nonadmitted;
            document.reportsForm.customerId.value = localStorage.getItem('CustomerId');
            document.reportsForm.formNumber.value = formNumber;
            document.reportsForm.action = action;
            document.reportsForm.fromDate.value = searchModel.fromDate;
            document.reportsForm.toDate.value = searchModel.toDate;
            document.reportsForm.timeDiff.value = new Date().getTimezoneOffset();
            document.reportsForm.timeDiff.value = new Date().getTimezoneOffset();
            document.reportsForm.admittedNadmitted.value = admittedNadmitted;
            document.reportsForm.runDate.value = $filter('date')(new Date(), 'MM/dd/yyyy hh:mm:ss a');
            document.reportsForm.printFormat.value = printFormat;
            document.reportsForm.submit();
        }

        /// <summary>
        /// Prints the page.
        /// </summary>
        function printPage() {
            var $printContainer = $('#printContainer');
            $printContainer.find('table').attr('border', '1');
            var data = $printContainer.html();
            $printContainer.find('table').removeAttr('border');
            var html = "<html>";
            html += data;
            html += "</html>";
            var printWin = window.open('', '', 'left=100,top=50,width=800,height=600,toolbar=0,scrollbars=0,status=0');
            printWin.document.write(html);
            printWin.document.close();
            printWin.focus();
            printWin.print();
            printWin.close();
        }

    }]);
app.directive("ngFormSubmit", [function () {
    return {
        require: "form",
        scope: {
            ngFormSubmit: '='
        },
        link: function ($scope, $el, $attr, $form) {

            $form.submit = function () {
                $el[0].action = $form.action;
                $el[0].submit();
            };
        }
    };
}]);