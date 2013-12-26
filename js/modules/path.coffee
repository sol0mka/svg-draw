define 'path', ['jquery', 'helpers', 'ProtoClass', 'line'], ($, helpers, ProtoClass, Line)->
	class Path extends ProtoClass
		type: 'path'
		isHoldCell: false
		constructor:(@o={})->
			@id = helpers.genHash()

			if @o.coords
				@set 
					startIJ: 	App.grid.toIJ @o.coords
					endIJ: 		App.grid.toIJ @o.coords


		onChange:-> 
			@oldIntersects = helpers.cloneObj @intersects
			@render()

		render:(isRepaintIntersects=false)->
			@removeFromGrid()
			@recalcPath()
			# @repaintIntersects @oldIntersects
			# @detectCollisions()
			@makeLine()
			App.grid.refreshGrid()

		recalcPath:->
			path = App.grid.getGapPolyfill 
								from: @startIJ
								to: 	@endIJ

			@points = []
			for point, i in path 
				ij = {i: point[0], j: point[1]}; xy = App.grid.fromIJ ij
				node = App.grid.atIJ ij
				node.holders ?= {}

				node.holders[@id] = @

				point = { x: xy.x, y: xy.y, curve: null, i: i }
				@points.push point
			@calcPolar()
			@

		calcPolar:->
			firstPoint  = @points[0]
			lastPoint 	= @points[@points.length-1]
			@xPolar = if firstPoint.x < lastPoint.x then 'plus' else 'minus'
			@yPolar = if firstPoint.y < lastPoint.y then 'plus' else 'minus'

		repaintIntersects:(intersects)->
			for name, path of intersects
				continue if path.id is @id 
				path.render [path.id]
			@oldIntersects = {}

		detectCollisions:()->
			@intersects = {}
			for point in @points
				myDirection = @directionAt point
				node = App.grid.at point
				if _.size(node.holders) > 1
					_.chain(node.holders).where(type: 'path').each (holder)=>
						@intersects[holder.id] = holder

					for name, holder of @intersects
						continue if holder.id is @id
						point.curve = "#{myDirection}" if myDirection isnt holder.directionAt(point) and holder.directionAt(point) isnt 'corner' and myDirection isnt 'corner'

		directionAt:(xy)->
			point = _.where(@points, {x: xy.x, y: xy.y})[0]
			if !point then return 'corner'
			if @points[point.i-1]?.x is point.x and @points[point.i+1]?.x is point.x
				direction = 'vertical'
			else if @points[point.i-1]?.y is point.y and @points[point.i+1]?.y is point.y
				direction = 'horizontal'
			else direction = 'corner'
			direction


		makeLine:()-> if !@line? then @line = new Line path: @ else @line.resetPoints @points

		removeFromGrid:->
			return if !@points?
			for point in @points
				node = App.grid.at(point)
				delete node.holders[@id]

		removeIfEmpty:-> 
			if @isEmpty()
				@line.remove()
				@removeFromGrid()
			App.grid.refreshGrid()

		isEmpty:-> 
			@line.points.length <= 2

	Path