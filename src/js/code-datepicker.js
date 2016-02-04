(function() {
  'use strict';

  angular
    .module('code-datepicker', ['ionic', 'code-datepicker.templates', 'code-datepicker.service'])
    .directive('codeDatepicker', codeDatepicker);

  /* @ngInject */
  function codeDatepicker($ionicGesture, $ionicModal, codeDatepickerService) {
    function initDatepicker(scope) {
      var parameters = {};
      var selectedDate = {};

      /* SET SELECTED DATE */
      if (angular.isDefined(scope.datepickerObject) &&
        angular.isDefined(scope.datepickerObject.date) &&
        angular.isDate(scope.datepickerObject.date)) {
        selectedDate = angular.copy(scope.datepickerObject.date);
      } else if (angular.isDefined(scope.datepickerObject) &&
        angular.isDefined(scope.datepickerObject.date) &&
        angular.isNumber(scope.datepickerObject.date)) {
        selectedDate = new Date(scope.datepickerObject.date);
      } else {
        selectedDate = new Date();
      }

      scope.selectedDate = selectedDate;
      scope.currentMonth = angular.copy(selectedDate);

      parameters = codeDatepickerService.getParameters(scope);

      /* CREATE MONTH CALENDAR */
      scope.createDatepicker = function(date) {
        var createMonthParam = {
          date: date,
          mondayFirst: parameters.mondayFirst,
          disablePastDays: parameters.disablePastDays,
          displayFrom: parameters.displayFrom,
          displayTo: parameters.displayTo,
          disableWeekend: parameters.disableWeekend,
          disableDates: parameters.disableDates,
          disableDaysOfWeek: parameters.disableDaysOfWeek,
          highlights: parameters.highlights
        };

        return codeDatepickerService.createMonth(createMonthParam);
      };

      scope.month = scope.createDatepicker(scope.selectedDate);
      scope.yearSlides = codeDatepickerService.getYears(parameters.startYear, parameters.endYear);
      scope.selectedYearSlide = codeDatepickerService.getActiveYearSlide(scope.yearSlides, scope.currentMonth.getFullYear());

      return parameters;
    }

    function setDate(scope, parameters) {
      if (angular.isDefined(scope.datepickerObject) && angular.isDefined(scope.datepickerObject.date)) {
        scope.datepickerObject.date = scope.selectedDate;
      }

      if (parameters.calendarMode || parameters.hideSetButton) {
        scope.closeModal();
      }

      if (angular.isDefined(parameters.callback)) {
        parameters.callback(scope.selectedDate);
      }
    }

    function link(scope, element, attrs) {
      var parameters = {};

      scope.datepicker = {
        showHeaderBar: false,
        headerBarClass: undefined,
        titleLabel: undefined,
        showLoader: false,
        showMonthModal: false,
        showYearModal: false,
        showTodayButton: false,
        calendarMode: false,
        hideCancelButton: false,
        hideSetButton: false
      };

      parameters = initDatepicker(scope);

      scope.datepicker.showHeaderBar = parameters.showHeaderBar;
      scope.datepicker.headerBarClass = parameters.headerBarClass;
      scope.datepicker.titleLabel = parameters.titleLabel;
      scope.datepicker.calendarMode = parameters.calendarMode;
      scope.datepicker.hideCancelButton = parameters.hideCancelButton;
      scope.datepicker.hideSetButton = parameters.hideSetButton;
      scope.datepicker.showTodayButton = codeDatepickerService.showTodayButton(parameters);

      /* VERIFY IF TWO DATES ARE EQUAL */
      scope.sameDate = function(date, compare) {
        return codeDatepickerService.sameDate(date, compare);
      };

      /* SELECT DATE METHOD */
      scope.selectDate = function(date, isDisabled) {
        if (!isDisabled) {
          scope.selectedDate = date;
          scope.month = scope.createDatepicker(scope.selectedDate);
          scope.currentMonth = angular.copy(date);
          scope.selectedYearSlide = codeDatepickerService.getActiveYearSlide(scope.yearSlides, scope.currentMonth.getFullYear());

          if (parameters.calendarMode || parameters.hideSetButton) {
            setDate(scope, parameters);
          }
        }
      };

      /* SELECT TODAY METHOD */
      scope.selectToday = function() {
        var date = new Date();
        scope.selectedDate = date;
        scope.month = scope.createDatepicker(scope.selectedDate);
        scope.currentMonth = angular.copy(date);
        scope.selectedYearSlide = codeDatepickerService.getActiveYearSlide(scope.yearSlides, scope.currentMonth.getFullYear());

        if (parameters.calendarMode || parameters.hideSetButton) {
          setDate(scope, parameters);
        }
      };

      /* SELECT MONTH METHOD */
      scope.selectMonth = function(monthIndex) {
        scope.currentMonth = new Date(scope.currentMonth.getFullYear(), monthIndex, 1);
        scope.month = scope.createDatepicker(scope.currentMonth);
        scope.closeMonthYearModals();
      };

      /* SELECT YEAR METHOD */
      scope.selectYear = function(year) {
        scope.currentMonth = new Date(year, scope.currentMonth.getMonth(), 1);
        scope.selectedYearSlide = codeDatepickerService.getActiveYearSlide(scope.yearSlides, scope.currentMonth.getFullYear());
        scope.closeYearModal();
      };

      /* NEXT MONTH METHOD */
      scope.nextMonth = function() {
        scope.currentMonth = new Date(scope.currentMonth.getFullYear(), scope.currentMonth.getMonth() + 1, 1);
        scope.selectedYearSlide = codeDatepickerService.getActiveYearSlide(scope.yearSlides, scope.currentMonth.getFullYear());
        scope.month = scope.createDatepicker(scope.currentMonth);
      };

      /* PREVIOUS MOTH METHOD */
      scope.previousMonth = function() {
        scope.currentMonth = codeDatepickerService.getPreviousMonth(scope.currentMonth);
        scope.selectedYearSlide = codeDatepickerService.getActiveYearSlide(scope.yearSlides, scope.currentMonth.getFullYear());
        scope.month = scope.createDatepicker(scope.currentMonth);
      };

      scope.swipeLeft = function() {
        if (!parameters.disableSwipe) {
          scope.nextMonth();
        }
      };

      scope.swipeRight = function() {
        if (!parameters.disableSwipe) {
          scope.previousMonth();
        }
      };

      /* CLOSE MODAL */
      scope.closeMonthYearModals = function() {
        scope.datepicker.showMonthModal = false;
        scope.datepicker.showYearModal = false;
      };

      /* OPEN SELECT MONTH MODAL */
      scope.openMonthModal = function() {
        scope.datepicker.showMonthModal = true;
      };

      /* OPEN SELECT YEAR MODAL */
      scope.openYearModal = function() {
        scope.datepicker.showMonthModal = false;
        scope.datepicker.showYearModal = true;
      };

      /* CLOSE SELECT MONTH MODAL */
      scope.closeYearModal = function() {
        scope.datepicker.showYearModal = false;
        scope.datepicker.showMonthModal = true;
      };

      scope.setDate = function() {
        setDate(scope, parameters);
        scope.closeModal();
      };

      scope.$watch('datepickerObject.date', function(date) {
        if (angular.isNumber(date)) {
          date = new Date(date);
        }

        if (!codeDatepickerService.sameDate(date, scope.selectedDate)) {
          scope.selectedDate = date;
          scope.month = scope.createDatepicker(scope.selectedDate);
          scope.currentMonth = angular.copy(date);

          scope.selectedYearSlide = codeDatepickerService.getActiveYearSlide(scope.yearSlides, scope.currentMonth.getFullYear());
        }
      });

      // init modal
      $ionicModal.fromTemplateUrl('code-datepicker-modal.tpl.html', {
        scope: scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        scope.modal = modal;
      });

      scope.openModal = function() {
        scope.modal.show();
      };

      scope.closeModal = function() {
        scope.modal.hide();
      };

      scope.$on('$destroy', function() {
        scope.modal.remove();
      });

      element.on("click", function() {
        scope.$apply(function() {
          initDatepicker(scope);
        });
        scope.openModal();
      });
    }

    var directive = {
      restrict: 'EA',
      scope: {
        datepickerObject: '=datepickerObject'
      },
      link: link
    };

    return directive;
  }
})();
