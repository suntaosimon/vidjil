
function Report() {
}

Report.prototype = {
    
    reportHTML : function() {
        var self = this
        
        this.w = window.open("report.html", "_blank", "selected=0, toolbar=yes, scrollbars=yes, resizable=yes");
    
        var list = m.getSelected()
        if (list.length==0) list = this.defaultList()
            
        this.w.onload = function(){
            self.addGraph(list)
                .readsStat()
                .addScatterplot()
        }
    },
    
    reportHTMLdiag : function() {
        var self = this
        
        this.w = window.open("report.html", "_blank", "selected=0, toolbar=yes, scrollbars=yes, resizable=yes");
    
        var list = m.getSelected()
        if (list.length==0) list = this.defaultList()
            
        this.w.onload = function(){
            for (var i=0; i<m.system_selected.length; i++){
                var system = m.system_selected[i]
                self.addScatterplot(system, m.t)
            }
        }
    },
    
    defaultList: function() {
        var list = []
        
        var tag=0
        while (tag < 8 && list.length < 5) {
            for (var i = 0; i < m.clones.length; i++) {
                var clone_tag = m.clone(i).getTag()
                if (clone_tag == tag && m.clone(i).isActive) list.push(i)
            }
            tag++
        }
        return list
    },
    
    addGraph : function(list) {
        
        //resize 791px ~> 21cm
        graph.resize(791,300)
        graph.draw(0)
        
        //add graph container now
        var w_graph = $('<div/>', {
            id: 'graph',
            class: 'container'
        }).appendTo(this.w.document.body);
        
        $('<h3/>', {
            text: "Monitoring"
        }).appendTo(w_graph);
        
        svg_graph = document.getElementById(graph.id+"_svg").cloneNode(true);
        
        for (var i = 0; i < m.clones.length; i++) {
            var polyline = svg_graph.querySelectorAll('[id="polyline'+i+'"]')[0]
            var tag = m.clone(i).getTag()
            var color = tagColor[tag]
            
            //stack
            if (polyline.getAttribute("d").indexOf("Z") != -1){
                polyline.setAttribute("style", "stroke-width:0px");
                polyline.setAttribute("fill", color);
            }else{//line
                if (list.indexOf(i) != -1){
                    polyline.setAttribute("style", "stroke-width:3px");
                }else if (tag != 8){
                    polyline.setAttribute("style", "stroke-width:1.5px");
                }else{
                    polyline.setAttribute("style", "stroke-width:0.5px; opacity:0.5");
                }
                polyline.setAttribute("stroke", color);
            }
            
            //remove "other" and disabled clones
            if (m.clone(i).id == "other" || !m.clone(i).isActive()) {
                polyline.parentNode.removeChild(polyline);
            }
        }
        
        w_graph.append(svg_graph)
        graph.resize();
        
        return this;
    },
    
    addScatterplot : function(system, time) {
        if (typeof system == "undefined") system = m.germlineV.system
        m.changeGermline(system)
        if (typeof time != "undefined") m.changeTime(time)
    
        //resize 791px ~> 21cm
        sp.resize(791,250)
        sp.fastForward()
        
        var w_sp = $('<div/>', {
            id: 'scatterplot',
            class: 'container'
        }).appendTo(this.w.document.body);
        
        $('<h3/>', {
            text: system + ' System for timepoint ' + m.getStrTime(m.t)
        }).appendTo(w_sp);
        
        svg_sp = document.getElementById(sp.id+"_svg").cloneNode(true);
        
        //set viewbox (same as resize)
        svg_sp.setAttribute("viewbox","0 0 791 250");
        
        
        for (var i = 0; i < m.clones.length; i++) {
            var circle = svg_sp.querySelectorAll('[id="circle'+i+'"]')[0]
            var color = tagColor[m.clone(i).getTag()]
            circle.setAttribute("stroke", color);
            
            //remove "other" and disabled clones
            if (m.clone(i).germline != system || m.clone(i).id == "other" || !m.clone(i).isActive()) {
                circle.parentNode.removeChild(circle);
            }
        }
        w_sp.append(svg_sp)
        sp.resize();

    },
    
    readsStat: function() {
        
        var container = $('<div/>', {
            class: 'container'
        }).appendTo(this.w.document.body);
        
        $('<h3/>', {
            text: ' Reads statistics '
        }).appendTo(container);
        
        var reads_stats = $('<div/>', {
            class: 'reads_stats'
        }).appendTo(container);
        
        var head = $('<div/>', {class: 'float-left'}).appendTo(reads_stats);
        $('<div/>', {class: 'case', text : ' '}).appendTo(head);
        $('<div/>', {class: 'case', text : 'total'}).appendTo(head);
        $('<div/>', {class: 'case', text : 'segmented'}).appendTo(head);
        
        for (var i=0; i<m.system_selected.length; i++){
            var system = m.system_selected[i]
            var system_label = $('<div/>', {class: 'case', text : system}).appendTo(head);
            $('<span/>', {class: 'system_colorbox', style:'background-color:'+m.germlineList.getColor(system)}).appendTo(system_label);
        }
        
        for (var i=0; i<m.samples.order.length; i++){
            var time = m.samples.order[i]
            
            var box = $('<div/>', {class: 'float-left'})
            $('<div/>', {class: 'case centered', text : m.getStrTime(time)}).appendTo(box);
            $('<div/>', {class: 'case centered', text : m.reads.total[time]}).appendTo(box);
            
            var segmented = ((m.reads.segmented[time]/m.reads.total[time])*100).toFixed(0) + "%"
            var seg_box = $('<div/>', {class: 'case centered', text : segmented}).appendTo(box);
            $('<div/>', {class: 'background1'}).appendTo(seg_box);
            $('<div/>', {class: 'background2', style: 'width:'+segmented}).appendTo(seg_box);
            
            var pie = $('<div/>').appendTo(box);
            
            var pie_label = $('<div/>', {class: 'left'}).appendTo(pie);
            for (var j=0; j<m.system_selected.length; j++){
                var system = m.system_selected[j]
                var value = ((m.systemSize(system,time))*100).toFixed(0) + "%"
                $('<div/>', {class: 'case', text : value}).appendTo(pie_label);
            }
            
            var pie_chart = $('<div/>', {class: 'left'}).appendTo(pie)
            var p = this.systemPie(time)
            p.setAttribute('style','margin:5px')
            pie_chart.append(p)
            
            box.appendTo(reads_stats);
        }
        
        return this;
    },
    
    systemPie: function(time) {
        if (typeof time == "undefined") time = m.t
        var radius = 40
        var pie = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        pie.setAttribute("viewbox","0 0 100 100");
        pie.setAttribute("width",(radius*2)+"px");
        pie.setAttribute("height",(radius*2)+"px");
        
        var start = 0
        for (var i=0; i<m.system_selected.length; i++){
            var system = m.system_selected[i]
            var value = m.systemSize(system,time)
            var angle = Math.PI*2*(value)
            var stop = start+angle
            
            if (value <1){
                var slice = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    
                var x1 = radius * Math.sin(start);
                var y1 = -radius * Math.cos(start);
                var x2 = radius * Math.sin(stop);
                var y2 = -radius * Math.cos(stop);
                
                var longArc = (stop-start <= Math.PI) ? 0 : 1;
                
                //d is a string that describes the path of the slice.
                var d = "M" + radius + "," + radius + " L" + (radius + x1) + "," + (radius + y1) + 
                        ", A" + radius + "," + radius + " 0 "+longArc+",1" + (radius + x2) + "," + (radius + y2) + 
                        " z";       
                slice.setAttribute('d', d);
                slice.setAttribute('fill', m.germlineList.getColor(system));
                pie.appendChild(slice)
            }else{
                var slice = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    
                slice.setAttribute('r', radius)
                slice.setAttribute('cx', radius)
                slice.setAttribute('cy', radius)
                slice.setAttribute('fill', m.germlineList.getColor(system));
                pie.appendChild(slice)
            }
            
            var start = stop;
        }

        return pie
    }
    
}

