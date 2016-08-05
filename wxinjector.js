window.rawSend = function(user,text,message,wait,callback,totalCount){
		var chatFactory = angular.element(document.body).injector().get('chatFactory');
		var confFactory = angular.element(document.body).injector().get('confFactory');
		if (totalCount==null || totalCount<=0){
			totalCount = 1;
		}
		var json = {
			MsgType: confFactory.MSGTYPE_TEXT,
			Content: text,
			ToUserName:user.UserName
		};
		json = $.extend({},json,message);
		var message = chatFactory.createMessage(json);
		(function(user,message,totalCount,callback,wait,chatFactory){
			setTimeout(function(){ 
				chatFactory.sendMessage(message);	    	
		    	if (callback!=null){
		    		callback(user,message,totalCount);
		    	} 
			}, wait);
		})(user,message,totalCount,callback,wait,chatFactory);
	}
	window.broadCastTo = function(list,text,message,step,callback,debug){
		var length = list.length;
		var sendFunc = window.rawSend;
		if (step==null || step<0){
			step = 250;
		}
		for(i=0;i<list.length;i++){
			var item = list[i];
			var u = angular.element(item).scope().user;
			(function(text,message,sendFunc,user,wait,callback,length){
				sendFunc(u,text,message,wait,callback,length);
			})(text,message,sendFunc,u,(i*step+10),callback,length);
			if(debug)break;
		}
	};

	window.broadCastAll = function(text,message,step,callback,debug){
		var list = $($("#navContact")[0]).find(".contact_item");
		window.broadCastTo(list,text,message,step,callback,debug);
	}

	window.uiSendClick = function(e){
		var root = $(".create_chatroom_dlg");
		var list = $(root.find(".selector")).find(".contactor");
		var text = $("#b_text").val();
		var message = {};
		try{
			message = $.parseJSON( $("#bAdvancedJson").val());
		}catch(e){
			message = {};
		}
		var step = $("#bSendGap").val()*1000;
		var debug = false;
		var callback = function (user,message,totalCount){
			var count = $("#bProgressPassed").attr("count");
			if (count==null){
				count = 0;
			}
			count = Number(count) + 1;
			$("#bProgressPassed").attr("count",count);
			var percent = 0;
			if (count<totalCount && totalCount>0){
				percent = Math.ceil( 100*Number(count)/Number(totalCount));
			}else{
				percent = 100;
			}
			$("#bProgressPassed").attr("style","width:"+percent+"%;border-top: 2px solid #3a98fb;");
		}
		if ($("input[name=range]:checked").val()==="all"){
			window.broadCastAll(text,message,step,callback,debug);
		}else{
			window.broadCastTo(list,text,message,step,callback,debug);
		}
	}

	window.initBroadCastUI = function(){
		var root = $(".create_chatroom_dlg");
		var init = root.attr("b_ui_inited");
		if (init==null || init==false){
			$(root.find(".ngdialog-content")[0]).attr("style","width:800px");
			$(root.find(".selector")).attr("style","width:50%;");
			$(root.find(".title")).text("群发");
			$(root.find(".dialog_bd")).attr("style","width:48%;");
			var right = '<div class="b_right_area" style="width:50%;top:50px;position: absolute;right: 10px;z-index:9999;">'+
	            '<h2 style="text-align: center;">群发内容</h2>'+
	            '<textarea id="b_text" style="height: 120px;width:100%;border-radius: 5px;padding: 10px;"></textarea>'+
	            '<h4>选项</h4>'+
	            '<div id="broadcast_option">'+
	                '<span>群发范围:</span>'+
	                '<input id="bSendSelected" type="radio" value="selected" name="range" checked="">选择的'+
	                '<input id="bSendAll" type="radio" value="all" name="range">所有<br>'+
	                '<span>速度选项:</span><br>'+
	                '间隔:<input id="bSendGap" type="text" value="2">秒'+
	            '</div>'+
	            '<div id="broadcast_advanced">'+
	                '<span>高级</span>'+
	                '<input id="bSendAdvanced" type="checkbox" name="badvanced"><br>'+
	                'message(json):<br>'+
	                '<textarea id="bAdvancedJson" style="width: 100%;height: 120px;border-radius: 5px;padding: 10px;">{}</textarea>'+
	            '</div>'+
	        '</div>';
			
			var progress = '<div id="bProgress" style="width: 100%;border-top: 2px solid #bfbdb8;">'+
	                '<div id="bProgressPassed" style="width:1%;border-top: 2px solid #3a98fb;"></div>'+
	            '</div>';
			right = right + progress;	            
			$(root.find(".dialog_bd")).after(right);	            
			$(root.find(".dialog_ft>a")).text("发送");
			


			$(".create_chatroom_dlg").find('.dialog_ft').on("DOMNodeInserted",
				function(){
					setTimeout(function(){
						$(".create_chatroom_dlg").find(".dialog_ft>a").text("发送");	
					},100);
					angular.element($(".create_chatroom_dlg").find(".dialog_ft>a")).scope().create = function (e){
						window.uiSendClick(e);
					};
			});
			$(".create_chatroom_dlg").find('.dialog_ft').on("DOMNodeRemoved",
				function(){
					setTimeout(function(){
						$(".create_chatroom_dlg").find(".dialog_ft>a").text("发送");	
					},100);
					
					angular.element($(".create_chatroom_dlg").find(".dialog_ft>a")).scope().create = function (e){
						window.uiSendClick(e);
					};
			});

			root.attr("b_ui_inited",true);
		}else{
			alert("ui not init");
		}
	}
	
	if ($("#b_start").length===0){

		var link = '<a id="b_start" href="javascript:;" class="button_default button" style="position: absolute;z-index: 9999;color: #02b300;margin-left: 160px;'+
				'text-decoration: none;">群发</a>';
		$(".main>.main_inner>.panel").before(link);
		$("#b_start").on("click",function(){
			$(".header").find(".opt").click();
			angular.element($("#mmpop_system_menu").find("ul>li>a")[0]).scope().createChatroom();
			setTimeout(function(){
				window.initBroadCastUI();	
			},500);
			
		});	
	}	
