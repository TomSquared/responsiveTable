/*
* jQuery ResponsiveTable v1.0
* http://www.tomsquared.de/jquery/responsiveTable
*
* Copyright 2013 TomSquared
* Free to use under the GPLv2 license.
* http://www.gnu.org/licenses/gpl-2.0.html
*
* Contributing author: Thomas Günther
*/

;(function($) {
	jQuery.fn.responsiveTable = function(options) {
		
		//Class ResponsiveTableHeaderField
		function ResponsiveTableHeaderField( header, jqElemTh ) {
			this.header = header;
			this.jqElemTh = jqElemTh;
			
			this.containerClass;
			this.colspan;
			this.initializeColspan( jqElemTh.attr( "colspan" ) );
			this.visible = true;
			
			this.columnIndexes = new Array();
			this.text = jqElemTh.text().replace(/\s/g, '');
			
			if (jqElemTh.attr( "data-hide" )) {
				defaultHideBehaviour = false;
				this.setHiddenOnDevices( jqElemTh.attr( "data-hide" ).split( " " ));
			}
			
			if (jqElemTh.attr( "data-container-class" ) != null ) {
				defaultContainerBehaviour = false;
				this.setContainerClass( jqElemTh.attr( "data-container-class" ));
			} 
		};
		
		ResponsiveTableHeaderField.prototype.initializeColspan = function( colSpan ) {
			if (colSpan) {
				if ( ! ( parseInt(colSpan, 10 ) > 0 ) ) {
					colSpan = 1;
				}
			} else {
				colSpan = 1;
			}
			//ensure that the colspan is the numeric value
			this.colSpan = colSpan * 1;
		};
		
		ResponsiveTableHeaderField.prototype.getColSpan = function () {
			return this.colSpan;
		};
		
		ResponsiveTableHeaderField.prototype.setVisible = function (visible) {
			this.visible = visible;
			if (visible) {
				this.jqElemTh.show();
			} else {
				this.jqElemTh.hide();
			}
		};
		
		ResponsiveTableHeaderField.prototype.isVisible = function () {
			return this.visible;
		};
		
		ResponsiveTableHeaderField.prototype.setHiddenOnDevices = function ( devices ) {
			for (var i in devices) {
				this.header.addHiddenTableHeaderForDevice(devices[i], this);
			};
		};
		
		ResponsiveTableHeaderField.prototype.getContainerClass = function () {
			return this.containerClass;
		};
		
		ResponsiveTableHeaderField.prototype.setContainerClass = function ( containerClass ) {
			
			if ( containerClass.length == 0) {
				containerClass = options.containerClass;
			}
			this.containerClass = containerClass;
			this.header.addHiddenFieldContainer(this);
		};
		
		ResponsiveTableHeaderField.prototype.addColumnIndex = function ( columnIndex ) {
			this.columnIndexes.push(columnIndex);
		};
		
		ResponsiveTableHeaderField.prototype.getFirstColumnIndex = function () {
			return this.columnIndexes[0];
		};
		
		ResponsiveTableHeaderField.prototype.getText = function () {
			return this.text;
		};
		
		//Class ResponsiveTableHeader
		function ResponsiveTableHeader ( table, jqElemTr ) {
					
			this.deviceHiddenTableHeaderMap = new Array();
			var devices = table.getDevices();
			for ( var deviceName in devices) {
				this.deviceHiddenTableHeaderMap[deviceName] = new Array(); 
			}
			
			this.hiddenFieldContainers = new Array();
			
			this.fields = new Array();
			
			var _obj = this;
			jqElemTr.find( "th" ).each( function (index) {
				_obj.fields.push(new ResponsiveTableHeaderField(_obj, $(this)));
			});
			
			//Initialize columnIndexesTableHeaderMap
			this.columnIndexesTableHeaderMap = new Array();
			for ( var i in this.fields ) {
				for ( var j = 0; j < this.fields[i].getColSpan(); j++ ) {
					this.columnIndexesTableHeaderMap.push(this.fields[i]);
					this.fields[i].addColumnIndex(this.columnIndexesTableHeaderMap.length - 1);
				};
			};
			
			//todo weiter default behaviour
			if (defaultHideBehaviour) {
				var deviceName = table.getDeviceNameForWidth(defaultOptions.devices['phone']);
				if (deviceName) {
					for (var i = 2; i < this.fields.length; i++) {
						this.addHiddenTableHeaderForDevice(deviceName, this.fields[i]);
					};
				};
				
			};
			
			if (defaultContainerBehaviour) {
				//get the first fiel which is not hidden
				if (this.fields.length > 0) {
					for (var i = 0; i < this.fields.length; i++) {
						if ( ! ( this.isFieldinHiddenTableHeaderMap(this.fields[i]) ) ) {
							this.addHiddenFieldContainer(this.fields[i]);
							break;
						}
					};
					
				};
			};
			
		};
		
		ResponsiveTableHeader.prototype.isHeaderFieldVisible = function ( columnIndex ) {
			return this.getHeaderFieldForColumnIndex( columnIndex ).isVisible();
		};
		
		ResponsiveTableHeader.prototype.getHeaderFieldForColumnIndex = function ( columnIndex ) {
			return this.columnIndexesTableHeaderMap[columnIndex];
		};
		
		ResponsiveTableHeader.prototype.addHiddenTableHeaderForDevice = function ( deviceName, tableHeaderField) {
			if ( !( deviceName in this.deviceHiddenTableHeaderMap ) ) return;
			this.deviceHiddenTableHeaderMap[deviceName].push(tableHeaderField);
		};
		
		ResponsiveTableHeader.prototype.hideHeadersForDevices = function ( deviceNames ) {
			if (this.hasHiddenHeadersForDevices( deviceNames )) {
				for (var i in deviceNames) {
					for (var key in this.deviceHiddenTableHeaderMap[deviceNames[i]]) {
						this.deviceHiddenTableHeaderMap[deviceNames[i]][key].setVisible(false);
					};
				}
				return true;
			}
			return false;
		};
		
		ResponsiveTableHeader.prototype.hasHiddenHeadersForDevices = function ( deviceNames ) {
			for (var i in deviceNames) {
				if (deviceNames[i] in this.deviceHiddenTableHeaderMap) return true;
			}
			return false;
		};
		
		ResponsiveTableHeader.prototype.setAllFieldsVisible = function () {
			for (var key in this.fields) {
				if ( !(this.fields[key].isVisible())) {
					this.fields[key].setVisible(true);
				};
			};
		};
		
		ResponsiveTableHeader.prototype.getFields = function() {
			return this.fields;
		};
		
		ResponsiveTableHeader.prototype.getNumAssignedColumns = function() {
			return this.columnIndexesTableHeaderMap.length;
		};
		
		ResponsiveTableHeader.prototype.isFieldinHiddenTableHeaderMap = function( field ) {
			for (var deviceName in this.deviceHiddenTableHeaderMap) {
				for (var i in this.deviceHiddenTableHeaderMap[deviceName]) {
					if (this.deviceHiddenTableHeaderMap[deviceName][i] === field) {
						return true;
					};
				};
			};
			return false;
		};
		
		ResponsiveTableHeader.prototype.addHiddenFieldContainer = function ( headerField ) {
			this.hiddenFieldContainers.push( headerField );
		};
		
		ResponsiveTableHeader.prototype.getHiddenFieldContainers = function () {
			return this.hiddenFieldContainers;
		};
		
		//Class ResponsiveTableColumns
		function ResponsiveTableColumns ( tableHeader ) {
			this.tableHeader = tableHeader;
			this.columns = new Array();
			for ( var columnIndex = 0 ; columnIndex < tableHeader.getNumAssignedColumns(); columnIndex++ ) {
				this.columns[columnIndex] = new Array();
			};
		};
		
		ResponsiveTableColumns.prototype.addFieldToColumn = function ( columnIndex, tableField ) {
			this.columns[ columnIndex ].push( tableField );
		};
		
		ResponsiveTableColumns.prototype.hideColumnsForDevices = function ( deviceNames ) {
			if ( this.tableHeader.hideHeadersForDevices( deviceNames ) ) {
				for ( var columnIndex = 0 ; columnIndex < this.tableHeader.getNumAssignedColumns(); columnIndex++ ) {
					if ( ! ( this.tableHeader.isHeaderFieldVisible( columnIndex ) ) ) {
						this.hideColumn( columnIndex );
					};
				};
				return true;
			};
			return false;
		};
		
		ResponsiveTableColumns.prototype.hideColumn = function ( columnIndex ) {
			for ( var rowIndex = 0; rowIndex < this.columns[columnIndex].length; rowIndex++ ) {
				this.columns[ columnIndex ][ rowIndex ].setVisible( false );
			}
			this.addColumnToHiddenFieldContainers( columnIndex );
		};
		
		ResponsiveTableColumns.prototype.showColumn = function ( columnIndex ) {
			for ( var rowIndex = 0; rowIndex < this.columns[columnIndex].length; rowIndex++ ) {
				this.columns[ columnIndex ][ rowIndex ].setVisible( true );
			}
			this.removeColumnFromHiddenFieldContainers( columnIndex );
		};
		
		ResponsiveTableColumns.prototype.showAllColumns = function() {
			for ( var columnIndex = 0; columnIndex < this.columns.length; columnIndex++ ) {
				var test = this.tableHeader.isHeaderFieldVisible ( columnIndex );
				if ( !(test) ) {
					this.showColumn( columnIndex );
				};
			}
			this.tableHeader.setAllFieldsVisible();
		};
		
		ResponsiveTableColumns.prototype.addColumnToHiddenFieldContainers = function ( columnIndex ) {
			var hiddenFieldContainers = this.tableHeader.getHiddenFieldContainers();
			for ( var rowIndex = 0; rowIndex < this.columns[columnIndex].length; rowIndex++ ) {
				for ( var i in hiddenFieldContainers ) {
					columnIndexHiddenFieldContainer = hiddenFieldContainers[ i ].getFirstColumnIndex();
					this.columns[ columnIndexHiddenFieldContainer ][ rowIndex ]
							.addHiddenColumn(
									this.tableHeader.getHeaderFieldForColumnIndex( columnIndex ), 
									this.columns[columnIndex][rowIndex],
									hiddenFieldContainers[ i ].getContainerClass()
							);
				};
			};
		};
		
		ResponsiveTableColumns.prototype.removeColumnFromHiddenFieldContainers = function ( columnIndex ) {
			var hiddenFieldContainers = this.tableHeader.getHiddenFieldContainers();
			for ( var rowIndex = 0; rowIndex < this.columns[columnIndex].length; rowIndex++ ) {
				for ( var i in hiddenFieldContainers ) {
					columnIndexHiddenFieldContainer = hiddenFieldContainers[ i ].getFirstColumnIndex();
					this.columns[ columnIndexHiddenFieldContainer ][ rowIndex ]
						.removeHiddenColumn(
								this.tableHeader.getHeaderFieldForColumnIndex( columnIndex ),
								hiddenFieldContainers[ i ].getContainerClass()
						);
				};
			};
		};
		
		//Class ResponsiveTableField
		function ResponsiveTableField( jqElemTd ) {
			this.jqElemTd = jqElemTd;
			this.visible = true;
			this.hiddenColumns = null;
			this.html = jqElemTd.contents().clone(true, true);
			this.jqElemTrHiddenRow = null;
			
		};
		
		ResponsiveTableField.prototype.addClickHandler = function () {
			var _obj = this;
			this.jqElemTd.off("click.responsiveTable");
			this.jqElemTd.on("click.responsiveTable", function(){
				//Check if row from previous call is there - in case of AJAX reloads
				var jqElemTrParent = $(this).parents( "tr:first" );
				var jqElemTrNext = jqElemTrParent.next("tr");
				if (jqElemTrNext.hasClass(options.extendedClass)) {
					_obj.jqElemTrHiddenRow = jqElemTrNext;
				}
				
		    	if (_obj.jqElemTrHiddenRow === null) {
		    		//create new row
		    		var jqElemTr = $( "<tr>" ).addClass(options.extendedClass);
		    		
		    		
		    		
					var jqElemDl = $( "<dl>" );
					for (var title in _obj.hiddenColumns) {
						jqElemDl.append($( "<dt>", 
								{ 
									"text" : title
								}
						));
						var jqElemDd = $( "<dd>" );
						for (var i in _obj.hiddenColumns[title]) {
							if (i == null) continue;
							jqElemDd.append(_obj.hiddenColumns[title][i].getHtml()).append( $( "<br/>" ) ); 
						}
						jqElemDl.append(jqElemDd);
					}
					
					
					
					jqElemTr.append( $( "<td>" ).attr("colspan", jqElemTrParent.find("td").size()).append( jqElemDl ) );
					_obj.jqElemTrHiddenRow = jqElemTr;
					_obj.jqElemTrHiddenRow.hide();
					jqElemTrParent.after(jqElemTr);
				} 
				_obj.jqElemTrHiddenRow.toggle('slow');
				return false;
			});
		};
		
		ResponsiveTableField.prototype.setVisible = function ( visible ) {
			this.visible = visible;
			if (visible) {
				this.jqElemTd.show();
			} else {
				this.jqElemTd.hide();
			}
		};
		
		ResponsiveTableField.prototype.getHtml = function () {
			return this.html;
		};
		
		ResponsiveTableField.prototype.addHiddenColumn = function ( headerField, field, containerClass ) {
			if (this.hiddenColumns === null) {
				this.hiddenColumns = new Object();
				this.jqElemTd.addClass(containerClass);
				this.addClickHandler();
			}
			var text = headerField.getText();
			if ( ! ( text in this.hiddenColumns ) ) {
				this.hiddenColumns[text] = new Array();
			}
			this.hiddenColumns[text].push(field);
			this.text;
		};
		
		ResponsiveTableField.prototype.removeHiddenColumn = function ( headerFieldHiddenColumn, containerClass ) {
			if ((this.hiddenColumns === null) ||
					( ! ( headerFieldHiddenColumn.getText() in this.hiddenColumns ) ) ) return;
			delete this.hiddenColumns[headerFieldHiddenColumn.getText()];
			//check if there are more fields
			var resetHiddenColumns = true;
			for (var text in this.hiddenColumns) {
				resetHiddenColumns = false;
				break;
			}
			if (resetHiddenColumns) {
				//remove clickhandler
				if (!(this.jqElemTrHiddenRow === null)) {
					this.jqElemTrHiddenRow.remove();
				}
				this.jqElemTrHiddenRow = null;
				this.jqElemTd.off("click.responsiveTable");
				this.jqElemTd.removeClass(containerClass);
				this.hiddenColumns = null;
			};
		};
		
		//Class ResponsiveTable
		function ResponsiveTable( jqElemTable ) {
			//devices
			this.devices = new Object();
			this.initializeDevices();
			this.lastDevice;
			
			this.jqElemTable = jqElemTable;
			this.header = new ResponsiveTableHeader( this, jqElemTable.find( "thead tr:first" ) );
			this.columns = new ResponsiveTableColumns( this.header );
			
			var _obj = this;
			var jqElemTrRows = jqElemTable.find( "tbody tr" );
			jqElemTrRows.each(function() {
				$(this).find( "td" ).each( function ( index ) {
					var tableField = new ResponsiveTableField( $( this ) );
					_obj.columns.addFieldToColumn ( index, tableField );
				});
			});
		};
		
		ResponsiveTable.prototype.initializeDevices = function() {
			this.devices = options.devices;
		};
		
		ResponsiveTable.prototype.getDevices = function() {
			return this.devices;
		};
		
		ResponsiveTable.prototype.getDeviceNameForWidth = function( width ) {
			var device = null;
			for ( var deviceName in this.devices ) {
				var deviceWidth = this.devices[deviceName];
				if ( width <=  deviceWidth) {
					if ( !( device === null ) ) {
						if ( ( deviceWidth - width ) 
								< ( this.devices[device] - width ) ) {
							device = deviceName;
						};
					} else {
						device = deviceName;
					};
				};
			};
			return device;
		};
		
		ResponsiveTable.prototype.hideColumnsForWidth = function ( width ) {
			
			var device = this.getDeviceNameForWidth( width );
			
			this.jqElemTable.removeClass(options.responsiveModeClass);
			
			//just do everything, if the new device is different to tha last device
			if (this.lastDevice != device) {
				//show all Columns
				this.columns.showAllColumns();
				if ( device != null ) {
					var parentDeviceNames = this.getParentDeviceNamesForDevice(device)
					parentDeviceNames.push(device);
					if (this.columns.hideColumnsForDevices(parentDeviceNames)){
						this.jqElemTable.addClass(options.responsiveModeClass);
					};
				};
			};
			this.lastDevice = device;
		};
		
		ResponsiveTable.prototype.getParentDeviceNamesForDevice = function( deviceName ) {
			var parentDeviceNames = new Array();
			var deviceWidth = this.devices[ deviceName ];
			for (var parentDeviceName in this.devices ) {
				if (deviceWidth < this.devices [ parentDeviceName ]) {
					parentDeviceNames.push(parentDeviceName);
				}
			}
			return parentDeviceNames;
		}
		
		var responsiveTable;
		var defaultHideBehaviour = true;
		var defaultContainerBehaviour = true;
		var waitForFinalEvent = (function () {
		  var timers = {};
		  return function ( callback, ms, uniqueId ) {
		    if ( timers[uniqueId] ) {
		      clearTimeout ( timers[uniqueId] );
		    }
		    timers[uniqueId] = setTimeout( callback, ms );
		  };
		})();
		
		//default options
		var defaultOptions = {
			responsiveModeClass : "responsive-table-hidden-fields",
			containerClass : "responsive-table-container",
			extendedClass : "responsive-table-extended",
			devices: {
				phone: 320,
				tablet: 768,
				desktop: 1024
			}
		};
		
		return this.each(function() {
			//ensure, that the table class isn't the responsive Mode Class
			if (options == null) {
				options = defaultOptions;
			} else {
				setDefaultOptions(defaultOptions, options);
			}
			responsiveTable = new ResponsiveTable($(this));
			
			checkResTablesForWindowWidth($(window).width());
			
			$( window ).resize( function () {
			    waitForFinalEvent( function(){
			    	checkResTablesForWindowWidth($(window).width());
			    }, 50, "resize");
			});
		});
		
		function checkResTablesForWindowWidth(windowWidth) {
			responsiveTable.hideColumnsForWidth( windowWidth );
		}
		
		function setDefaultOptions(defaultOptions, options) {
			for (var optionName in defaultOptions) {
				if ( !( optionName in options ) ) {
					options[optionName] = defaultOptions[optionName];
				}
			}
		}
	};

})(jQuery);
